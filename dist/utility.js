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
exports.getFileNameFromPath = exports.archiveFolderForDeployment = exports.generateTemporaryFolderForDeployment = exports.copyDirectory = exports.isMSDeployPackage = exports.generateTemporaryFolderOrZipPath = exports.findfiles = exports.canUseWebDeploy = exports.copySetParamFileIfItExists = exports.fileExists = exports.isInputPkgIsFolder = void 0;
const path = require("path");
const tl = require("azure-pipelines-task-lib/task");
const packageUtility_1 = require("./packageUtility");
var zipUtility = require('./ziputility.js');
/**
 * Validates the input package and finds out input type
 *
 * @param webDeployPkg Web Deploy Package input
 *
 * @return true/false based on input package type.
 */
function isInputPkgIsFolder(webDeployPkg) {
    if (!tl.exist(webDeployPkg)) {
        throw new Error(tl.loc('Invalidwebapppackageorfolderpathprovided', webDeployPkg));
    }
    return !fileExists(webDeployPkg);
}
exports.isInputPkgIsFolder = isInputPkgIsFolder;
/**
 * Checks whether the given path is file or not.
 * @param path input file path
 *
 * @return true/false based on input is file or not.

 */
function fileExists(path) {
    try {
        return tl.stats(path).isFile();
    }
    catch (error) {
        if (error.code == 'ENOENT') {
            return false;
        }
        tl.debug("Exception tl.stats (" + path + "): " + error);
        throw Error(error);
    }
}
exports.fileExists = fileExists;
/**
 * Validates whether input for path and returns right path.
 *
 * @param path input
 *
 * @returns null when input is empty, otherwise returns same path.
 */
function copySetParamFileIfItExists(setParametersFile) {
    if (!setParametersFile || (!tl.filePathSupplied('SetParametersFile')) || setParametersFile == tl.getVariable('System.DefaultWorkingDirectory')) {
        setParametersFile = null;
    }
    else if (!fileExists(setParametersFile)) {
        throw Error(tl.loc('SetParamFilenotfound0', setParametersFile));
    }
    else if (fileExists(setParametersFile)) {
        var tempSetParametersFile = path.join(tl.getVariable('System.DefaultWorkingDirectory'), Date.now() + "_tempSetParameters.xml");
        tl.cp(setParametersFile, tempSetParametersFile, '-f');
        setParametersFile = tempSetParametersFile;
    }
    return setParametersFile;
}
exports.copySetParamFileIfItExists = copySetParamFileIfItExists;
/**
 * Checks if WebDeploy should be used to deploy webapp package or folder
 *
 * @param useWebDeploy if user explicitly checked useWebDeploy
 */
function canUseWebDeploy(useWebDeploy) {
    var win = tl.osType().match(/^Win/);
    return (useWebDeploy || win);
}
exports.canUseWebDeploy = canUseWebDeploy;
function findfiles(filepath) {
    tl.debug("Finding files matching input: " + filepath);
    var filesList;
    if (filepath.indexOf('*') == -1 && filepath.indexOf('?') == -1) {
        // No pattern found, check literal path to a single file
        if (tl.exist(filepath)) {
            filesList = [filepath];
        }
        else {
            tl.debug('No matching files were found with search pattern: ' + filepath);
            return [];
        }
    }
    else {
        var firstWildcardIndex = function (str) {
            var idx = str.indexOf('*');
            var idxOfWildcard = str.indexOf('?');
            if (idxOfWildcard > -1) {
                return (idx > -1) ?
                    Math.min(idx, idxOfWildcard) : idxOfWildcard;
            }
            return idx;
        };
        // Find app files matching the specified pattern
        tl.debug('Matching glob pattern: ' + filepath);
        // First find the most complete path without any matching patterns
        var idx = firstWildcardIndex(filepath);
        tl.debug('Index of first wildcard: ' + idx);
        var slicedPath = filepath.slice(0, idx);
        var findPathRoot = path.dirname(slicedPath);
        if (slicedPath.endsWith("\\") || slicedPath.endsWith("/")) {
            findPathRoot = slicedPath;
        }
        tl.debug('find root dir: ' + findPathRoot);
        // Now we get a list of all files under this root
        var allFiles = tl.find(findPathRoot);
        // Now matching the pattern against all files
        filesList = tl.match(allFiles, filepath, '', { matchBase: true, nocase: !!tl.osType().match(/^Win/) });
        // Fail if no matching files were found
        if (!filesList || filesList.length == 0) {
            tl.debug('No matching files were found with search pattern: ' + filepath);
            return [];
        }
    }
    return filesList;
}
exports.findfiles = findfiles;
function generateTemporaryFolderOrZipPath(folderPath, isFolder) {
    var randomString = Math.random().toString().split('.')[1];
    var tempPath = path.join(folderPath, 'temp_web_package_' + randomString + (isFolder ? "" : ".zip"));
    if (tl.exist(tempPath)) {
        return generateTemporaryFolderOrZipPath(folderPath, isFolder);
    }
    return tempPath;
}
exports.generateTemporaryFolderOrZipPath = generateTemporaryFolderOrZipPath;
/**
 * Check whether the package contains parameter.xml file
 * @param   webAppPackage   web deploy package
 * @returns boolean
 */
function isMSDeployPackage(webAppPackage) {
    return __awaiter(this, void 0, void 0, function* () {
        var isParamFilePresent = false;
        var pacakgeComponent = yield zipUtility.getArchivedEntries(webAppPackage);
        if (((pacakgeComponent["entries"].indexOf("parameters.xml") > -1) || (pacakgeComponent["entries"].indexOf("Parameters.xml") > -1)) &&
            ((pacakgeComponent["entries"].indexOf("systemInfo.xml") > -1) || (pacakgeComponent["entries"].indexOf("systeminfo.xml") > -1) || (pacakgeComponent["entries"].indexOf("SystemInfo.xml") > -1))) {
            isParamFilePresent = true;
        }
        tl.debug("Is the package an msdeploy package : " + isParamFilePresent);
        return isParamFilePresent;
    });
}
exports.isMSDeployPackage = isMSDeployPackage;
function copyDirectory(sourceDirectory, destDirectory) {
    if (!tl.exist(destDirectory)) {
        tl.mkdirP(destDirectory);
    }
    var listSrcDirectory = tl.find(sourceDirectory);
    for (var srcDirPath of listSrcDirectory) {
        var relativePath = srcDirPath.substring(sourceDirectory.length);
        var destinationPath = path.join(destDirectory, relativePath);
        if (tl.stats(srcDirPath).isDirectory()) {
            tl.mkdirP(destinationPath);
        }
        else {
            if (!tl.exist(path.dirname(destinationPath))) {
                tl.mkdirP(path.dirname(destinationPath));
            }
            tl.debug('copy file from: ' + srcDirPath + ' to: ' + destinationPath);
            tl.cp(srcDirPath, destinationPath, '-f', false);
        }
    }
}
exports.copyDirectory = copyDirectory;
function generateTemporaryFolderForDeployment(isFolderBasedDeployment, webDeployPkg, packageType) {
    return __awaiter(this, void 0, void 0, function* () {
        var folderName = tl.getVariable('Agent.TempDirectory') ? tl.getVariable('Agent.TempDirectory') : tl.getVariable('System.DefaultWorkingDirectory');
        var folderPath = generateTemporaryFolderOrZipPath(folderName, true);
        if (isFolderBasedDeployment || packageType === packageUtility_1.PackageType.jar) {
            tl.debug('Copying Web Packge: ' + webDeployPkg + ' to temporary location: ' + folderPath);
            copyDirectory(webDeployPkg, folderPath);
            tl.debug('Copied Web Package: ' + webDeployPkg + ' to temporary location: ' + folderPath + ' successfully.');
        }
        else {
            yield zipUtility.unzip(webDeployPkg, folderPath);
        }
        return folderPath;
    });
}
exports.generateTemporaryFolderForDeployment = generateTemporaryFolderForDeployment;
function archiveFolderForDeployment(isFolderBasedDeployment, folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        var webDeployPkg;
        if (isFolderBasedDeployment) {
            webDeployPkg = folderPath;
        }
        else {
            var tempWebPackageZip = generateTemporaryFolderOrZipPath(tl.getVariable('System.DefaultWorkingDirectory'), false);
            webDeployPkg = yield zipUtility.archiveFolder(folderPath, "", tempWebPackageZip);
        }
        return {
            "webDeployPkg": webDeployPkg,
            "tempPackagePath": webDeployPkg
        };
    });
}
exports.archiveFolderForDeployment = archiveFolderForDeployment;
function getFileNameFromPath(filePath, extension) {
    var isWindows = tl.osType().match(/^Win/);
    var fileName;
    if (isWindows) {
        fileName = path.win32.basename(filePath, extension);
    }
    else {
        fileName = path.posix.basename(filePath, extension);
    }
    return fileName;
}
exports.getFileNameFromPath = getFileNameFromPath;
