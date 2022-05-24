"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LtxDomUtility = void 0;
var ltx = require("ltx");
var varUtility = require("./variableutility.js");
var Q = require('q');
class LtxDomUtility {
    constructor(xmlContent) {
        this.xmlDomLookUpTable = {};
        this.xmlDomLookUpTable = {};
        this.headerContent = null;
        this.xmlDom = ltx.parse(xmlContent);
        this.readHeader(xmlContent);
        this.buildLookUpTable(this.xmlDom);
    }
    getXmlDom() {
        return this.xmlDom;
    }
    readHeader(xmlContent) {
        var index = xmlContent.indexOf('\n');
        if (index > -1) {
            var firstLine = xmlContent.substring(0, index).trim();
            if (firstLine.startsWith("<?") && firstLine.endsWith("?>")) {
                this.headerContent = firstLine;
            }
        }
    }
    getContentWithHeader(xmlDom) {
        return xmlDom ? (this.headerContent ? this.headerContent + "\n" : "") + xmlDom.root().toString() : "";
    }
    /**
     * Define method to create a lookup for DOM
     */
    buildLookUpTable(node) {
        if (node) {
            var nodeName = node.name;
            if (nodeName) {
                nodeName = nodeName.toLowerCase();
                var listOfNodes = this.xmlDomLookUpTable[nodeName];
                if (listOfNodes == null || !(Array.isArray(listOfNodes))) {
                    listOfNodes = [];
                    this.xmlDomLookUpTable[nodeName] = listOfNodes;
                }
                listOfNodes.push(node);
                var childNodes = node.children;
                for (var i = 0; i < childNodes.length; i++) {
                    var childNodeName = childNodes[i].name;
                    if (childNodeName) {
                        this.buildLookUpTable(childNodes[i]);
                    }
                }
            }
        }
    }
    /**
     *  Returns array of nodes which match with the tag name.
     */
    getElementsByTagName(nodeName) {
        if (varUtility.isEmpty(nodeName))
            return [];
        var selectedElements = this.xmlDomLookUpTable[nodeName.toLowerCase()];
        if (!selectedElements) {
            selectedElements = [];
        }
        return selectedElements;
    }
    /**
     *  Search in subtree with provided node name
     */
    getChildElementsByTagName(node, tagName) {
        if (!varUtility.isObject(node))
            return [];
        var children = node.children;
        var liveNodes = [];
        if (children) {
            for (var i = 0; i < children.length; i++) {
                var childName = children[i].name;
                if (!varUtility.isEmpty(childName) && tagName == childName) {
                    liveNodes.push(children[i]);
                }
                var liveChildNodes = this.getChildElementsByTagName(children[i], tagName);
                if (liveChildNodes && liveChildNodes.length > 0) {
                    liveNodes = liveNodes.concat(liveChildNodes);
                }
            }
        }
        return liveNodes;
    }
}
exports.LtxDomUtility = LtxDomUtility;
