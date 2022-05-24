var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var xmlSubstitutionUtility = require('../src/xmlvariablesubstitutionutility');
var path = require('path');
function xmlVariableSubstitution() {
    return __awaiter(this, void 0, void 0, function* () {
        var tags = ["applicationSettings", "appSettings", "connectionStrings", "configSections", "system.serviceModel"];
        var configFiles = [path.join(__dirname, 'configs/Web.config')];
        var variableMap = {
            'BasicHttpBinding_PesquisarDocumentoSSSoap': 'http://address-1.local/',
            'BasicHttpBinding_ObterDocumentoSSSoap': 'http://address-2.local/',
            'BasicHttpBinding_CriarDocumentoSSSoap': 'http://address-3.local/',
            'WSHttpBinding_PesquisarDocumentoSoap': 'http://address-4.local/',
            'BasicHttpBinding_INSSPaymentsSoap': 'http://address-5.local/',
            'BasicHttpBinding_IServicoGlobalINSS': 'http://address-6.local/',
            'WSHttpBinding_ProvaOnlineApp': 'http://address-7.local/',
            'BasicHttpBinding_ConsultaMinisterioJustica': 'http://address-8.local/',
            'BasicHttpBinding_IControleSMSApp': 'http://address-9.local/',
            'BasicHttpBinding_IEMISApp': 'http://address-10.local/',
            'BasicHttpBinding_IIbanApp': 'http://address-11.local/',
            'BasicHttpBinding_IComunicacaoMJ': 'http://address-12.local/'
        };
        var parameterFilePath = null;
        for (var configFile of configFiles) {
            yield xmlSubstitutionUtility.substituteAppSettingsVariables(configFile, tags, variableMap, parameterFilePath);
        }
    });
}
xmlVariableSubstitution();
