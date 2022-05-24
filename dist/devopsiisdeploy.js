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
const tl = require("azure-pipelines-task-lib/task");
const path = require("path");
var msDeploy = require('azure-pipelines-tasks-webdeployment-common/deployusingmsdeploy.js');
var utility = require('azure-pipelines-tasks-webdeployment-common/utility.js');
var fileTransformationsUtility = require('./fileTransformationsUtility.js');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            tl.setResourcePath(path.join(__dirname, 'node_modules/azure-pipelines-tasks-webdeployment-common/module.json'));
            var webSiteName = tl.getInput('WebSiteName', true);
            var virtualApplication = tl.getInput('VirtualApplication', false);
            var webDeployPkg = tl.getPathInput('Package', true);
            var setParametersFile = tl.getPathInput('SetParametersFile', false);
            var removeAdditionalFilesFlag = tl.getBoolInput('RemoveAdditionalFilesFlag', false);
            var excludeFilesFromAppDataFlag = tl.getBoolInput('ExcludeFilesFromAppDataFlag', false);
            var takeAppOfflineFlag = tl.getBoolInput('TakeAppOfflineFlag', false);
            var additionalArguments = tl.getInput('AdditionalArguments', false);
            var xmlTransformation = tl.getBoolInput('XmlTransformation', false);
            var JSONFiles = tl.getDelimitedInput('JSONFiles', '\n', false);
            var xmlVariableSubstitution = tl.getBoolInput('XmlVariableSubstitution', false);
            var availableWebPackages = utility.findfiles(webDeployPkg);
            var tempPackagePath = null;
            if (availableWebPackages.length == 0) {
                throw new Error(tl.loc('Nopackagefoundwithspecifiedpattern'));
            }
            if (availableWebPackages.length > 1) {
                throw new Error(tl.loc('MorethanonepackagematchedwithspecifiedpatternPleaserestrainthesearchpattern'));
            }
            webDeployPkg = availableWebPackages[0];
            var isFolderBasedDeployment = yield utility.isInputPkgIsFolder(webDeployPkg);
            if (JSONFiles.length != 0 || xmlTransformation || xmlVariableSubstitution) {
                var folderPath = yield utility.generateTemporaryFolderForDeployment(isFolderBasedDeployment, webDeployPkg);
                var isMSBuildPackage = !isFolderBasedDeployment && (yield utility.isMSDeployPackage(webDeployPkg));
                fileTransformationsUtility.fileTransformations(isFolderBasedDeployment, JSONFiles, xmlTransformation, xmlVariableSubstitution, folderPath, isMSBuildPackage);
                var output = yield utility.archiveFolderForDeployment(isFolderBasedDeployment, folderPath);
                tempPackagePath = output.tempPackagePath;
                webDeployPkg = output.webDeployPkg;
            }
            yield msDeploy.DeployUsingMSDeploy(webDeployPkg, webSiteName, null, removeAdditionalFilesFlag, excludeFilesFromAppDataFlag, takeAppOfflineFlag, virtualApplication, setParametersFile, additionalArguments, isFolderBasedDeployment, true);
        }
        catch (error) {
            tl.setResult(tl.TaskResult.Failed, error);
        }
    });
}
run();
