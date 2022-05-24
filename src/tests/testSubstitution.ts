var xmlSubstitutionUtility = require('../xmlvariablesubstitutionutility.js');
var path = require('path');

async function xmlVariableSubstitution() {
    var tags = ["applicationSettings", "appSettings", "connectionStrings", "configSections", "system.serviceModel"];
    var configFiles = [path.join(__dirname, 'configs/Web.config')];
    var variableMap = {
        'Ambiente': 'desenvolvimento',
        'Database': 'database-connection-string',
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
    }

    var parameterFilePath = null;

    for (var configFile of configFiles) {
        await xmlSubstitutionUtility.substituteXmlVariables(configFile, tags, variableMap, parameterFilePath);
    }
}

xmlVariableSubstitution();
