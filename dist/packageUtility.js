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
exports.Package = exports.PackageUtility = exports.PackageType = void 0;
const tl = require("azure-pipelines-task-lib/task");
const utility = require("./utility");
var zipUtility = require('./ziputility.js');
const path = require("path");
var PackageType;
(function (PackageType) {
    PackageType[PackageType["war"] = 0] = "war";
    PackageType[PackageType["zip"] = 1] = "zip";
    PackageType[PackageType["jar"] = 2] = "jar";
    PackageType[PackageType["folder"] = 3] = "folder";
})(PackageType = exports.PackageType || (exports.PackageType = {}));
class PackageUtility {
    static getPackagePath(packagePath) {
        var availablePackages = utility.findfiles(packagePath);
        if (availablePackages.length == 0) {
            throw new Error(tl.loc('Nopackagefoundwithspecifiedpattern', packagePath));
        }
        if (availablePackages.length > 1) {
            throw new Error(tl.loc('MorethanonepackagematchedwithspecifiedpatternPleaserestrainthesearchpattern', packagePath));
        }
        return availablePackages[0];
    }
    static getArtifactAlias(packagePath) {
        let artifactAlias = null;
        if (tl.getVariable('release.releaseId')) {
            // Determine artifact alias from package path if task is running in release.
            let workingDirectory = tl.getVariable("system.defaultworkingdirectory");
            try {
                if (workingDirectory && packagePath.indexOf(workingDirectory) == 0) {
                    let relativePackagePath = packagePath.substring(workingDirectory.length);
                    if (relativePackagePath.indexOf(path.sep) == 0) {
                        relativePackagePath = relativePackagePath.substring(1);
                    }
                    let endIndex = relativePackagePath.indexOf(path.sep);
                    endIndex = endIndex >= 0 ? endIndex : relativePackagePath.length;
                    artifactAlias = relativePackagePath.substring(0, endIndex);
                    if (!tl.getVariable(`release.artifacts.${artifactAlias}.definitionId`)) {
                        // Artifact alias determined is not correct, set it to null
                        tl.debug(`Incorrect artifact alias ${artifactAlias} determined for package path ${packagePath}`);
                        artifactAlias = null;
                    }
                }
            }
            catch (error) {
                artifactAlias = null;
                tl.debug(`Error in determining artifact alias of package. Error: ${error}`);
            }
        }
        tl.debug("Artifact alias of package is: " + artifactAlias);
        return artifactAlias;
    }
}
exports.PackageUtility = PackageUtility;
class Package {
    constructor(packagePath) {
        this._path = PackageUtility.getPackagePath(packagePath);
        this._isMSBuildPackage = undefined;
    }
    getPath() {
        return this._path;
    }
    isMSBuildPackage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isMSBuildPackage == undefined) {
                this._isMSBuildPackage = false;
                if (this.getPackageType() != PackageType.folder) {
                    var pacakgeComponent = yield zipUtility.getArchivedEntries(this._path);
                    if (((pacakgeComponent["entries"].indexOf("parameters.xml") > -1) || (pacakgeComponent["entries"].indexOf("Parameters.xml") > -1)) &&
                        ((pacakgeComponent["entries"].indexOf("systemInfo.xml") > -1) || (pacakgeComponent["entries"].indexOf("systeminfo.xml") > -1)
                            || (pacakgeComponent["entries"].indexOf("SystemInfo.xml") > -1))) {
                        this._isMSBuildPackage = true;
                    }
                }
                tl.debug("Is the package an msdeploy package : " + this._isMSBuildPackage);
            }
            return this._isMSBuildPackage;
        });
    }
    getPackageType() {
        if (this._packageType == undefined) {
            if (!tl.exist(this._path)) {
                throw new Error(tl.loc('Invalidwebapppackageorfolderpathprovided', this._path));
            }
            else {
                if (this._path.toLowerCase().endsWith('.war')) {
                    this._packageType = PackageType.war;
                    tl.debug("This is war package ");
                }
                else if (this._path.toLowerCase().endsWith('.jar')) {
                    this._packageType = PackageType.jar;
                    tl.debug("This is jar package ");
                }
                else if (this._path.toLowerCase().endsWith('.zip')) {
                    this._packageType = PackageType.zip;
                    tl.debug("This is zip package ");
                }
                else if (!tl.stats(this._path).isFile()) {
                    this._packageType = PackageType.folder;
                    tl.debug("This is folder package ");
                }
                else {
                    throw new Error(tl.loc('Invalidwebapppackageorfolderpathprovided', this._path));
                }
            }
        }
        return this._packageType;
    }
    isFolder() {
        if (this._isFolder == undefined) {
            if (!tl.exist(this._path)) {
                throw new Error(tl.loc('Invalidwebapppackageorfolderpathprovided', this._path));
            }
            this._isFolder = !tl.stats(this._path).isFile();
        }
        return this._isFolder;
    }
}
exports.Package = Package;
