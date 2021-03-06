"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArchivedEntries = exports.archiveFolder = exports.unzip = void 0;
const tl = require("azure-pipelines-task-lib/task");
const path = require("path");
const Q = require("q");
const fs = require("fs");
var DecompressZip = require('decompress-zip');
var archiver = require('archiver');
const deleteDir = (path) => tl.exist(path) && tl.rmRF(path);
const extractWindowsZip = (fromFile, toDir) => __awaiter(void 0, void 0, void 0, function* () {
    let forceUsePSUnzip = process.env['ADO_FORCE_USE_PSUNZIP'] || 'false';
    tl.debug(`ADO_FORCE_USE_PSUNZIP = '${forceUsePSUnzip}'`);
    if (forceUsePSUnzip.toLowerCase() === 'true') {
        yield extractUsingPowerShell(fromFile, toDir);
    }
    else {
        yield extractUsing7zip(fromFile, toDir);
    }
});
const extractUsingPowerShell = (fromFile, toDir) => __awaiter(void 0, void 0, void 0, function* () {
    tl.debug(`Using PowerShell for extracting zip ${fromFile}`);
    let command = `Expand-Archive -Path "${fromFile}" -DestinationPath "${toDir}" -Force`;
    tl.debug(`Command to execute: '${command}'`);
    let powershellPath = '';
    let packageSizeInMB = 0;
    try {
        let packageStats = fs.statSync(fromFile);
        // size in mb
        packageSizeInMB = Math.floor(packageStats.size / 1024 / 1024);
    }
    catch (error) {
        tl.debug("Error occurred while trying to calculate package size in MB.");
        tl.debug(error);
        packageSizeInMB = -1;
    }
    tl.debug(`Package Size = '${packageSizeInMB}' MB`);
    // We prefer to decompress usng powershell core (pwsh.exe) rather than windows powershell (powershell.exe)
    // because of pwsh offers significantly better performance. But on private agents, the presence of pwsh
    // is not guaranteed. And so, if we are not able to find pwsh.exe, we fall back to powershell.exe
    try {
        powershellPath = tl.which('pwsh', true);
    }
    catch (error) {
        tl.debug(`Tool 'pwsh' not found. Error: ${error}`);
        tl.debug("PowerShell core is not available on agent machine. Falling back to using Windows PowerShell.");
        console.log(tl.loc('PwshNotAvailable'));
        powershellPath = tl.which('powershell', true);
    }
    tl.debug(`Powershell path: '${powershellPath}'`);
    let powershell = tl.tool(powershellPath)
        .arg('-NoLogo')
        .arg('-NoProfile')
        .arg('-NonInteractive')
        .arg('-Command')
        .arg(command);
    let options = {
        failOnStdErr: false,
        errStream: process.stdout,
        outStream: process.stdout,
        ignoreReturnCode: true
    };
    let startTimeInSeconds = 0;
    let endTimeInSeconds = 0;
    startTimeInSeconds = Math.round(Date.now() / 1000);
    let exitCode = yield powershell.exec(options);
    endTimeInSeconds = Math.round(Date.now() / 1000);
    let timeToExtractInSeconds = endTimeInSeconds - startTimeInSeconds;
    tl.debug(`Time to extract msbuild package in seconds = '${timeToExtractInSeconds}'`);
    let telemetry = `{ "PackageSizeInMB": "${packageSizeInMB}", "TimeToExtractInSeconds": "${timeToExtractInSeconds}" }`;
    tl.debug(`telemetry = '${telemetry}'`);
    console.log(`##vso[telemetry.publish area=TaskHub;feature=MSBuildPackageExtraction]${telemetry}`);
    if (exitCode !== 0) {
        throw ("Archive extraction using powershell failed.");
    }
});
const extractUsing7zip = (fromFile, toDir) => __awaiter(void 0, void 0, void 0, function* () {
    tl.debug('Using 7zip tool for extracting');
    var win7zipLocation = path.join(__dirname, '7zip/7z.exe');
    yield tl.tool(win7zipLocation)
        .arg(['x', `-o${toDir}`, fromFile])
        .exec();
});
const extractUsingUnzip = (fromFile, toDir) => __awaiter(void 0, void 0, void 0, function* () {
    tl.debug('Using unzip tool for extracting');
    var unzipToolLocation = tl.which('unzip', true);
    yield tl.tool(unzipToolLocation)
        .arg([fromFile, '-d', toDir])
        .exec();
});
function unzip(zipFileLocation, unzipDirLocation) {
    return __awaiter(this, void 0, void 0, function* () {
        deleteDir(unzipDirLocation);
        const isWin = tl.getPlatform() === tl.Platform.Windows;
        tl.debug('windows platform: ' + isWin);
        tl.debug('extracting ' + zipFileLocation + ' to ' + unzipDirLocation);
        if (isWin) {
            yield extractWindowsZip(zipFileLocation, unzipDirLocation);
        }
        else {
            yield extractUsingUnzip(zipFileLocation, unzipDirLocation);
        }
        tl.debug('extracted ' + zipFileLocation + ' to ' + unzipDirLocation + ' Successfully');
    });
}
exports.unzip = unzip;
function archiveFolder(folderPath, targetPath, zipName) {
    return __awaiter(this, void 0, void 0, function* () {
        var defer = Q.defer();
        tl.debug('Archiving ' + folderPath + ' to ' + zipName);
        var outputZipPath = path.join(targetPath, zipName);
        var output = fs.createWriteStream(outputZipPath);
        var archive = archiver('zip');
        output.on('close', function () {
            tl.debug('Successfully created archive ' + zipName);
            defer.resolve(outputZipPath);
        });
        output.on('error', function (error) {
            defer.reject(error);
        });
        archive.pipe(output);
        archive.directory(folderPath, '/');
        archive.finalize();
        return defer.promise;
    });
}
exports.archiveFolder = archiveFolder;
/**
 *  Returns array of files present in archived package
 */
function getArchivedEntries(archivedPackage) {
    return __awaiter(this, void 0, void 0, function* () {
        var deferred = Q.defer();
        var unzipper = new DecompressZip(archivedPackage);
        unzipper.on('error', function (error) {
            deferred.reject(error);
        });
        unzipper.on('list', function (files) {
            var packageComponent = {
                "entries": files
            };
            deferred.resolve(packageComponent);
        });
        unzipper.list();
        return deferred.promise;
    });
}
exports.getArchivedEntries = getArchivedEntries;
