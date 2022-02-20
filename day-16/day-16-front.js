import { CalculationModel, CalculationController } from '../front-superclasses.js';
import { default as util } from '../util-v2.js';


class Packet {
    constructor(binStr, startIndex) {
        const typeIdStart = startIndex + 3;
        const contentStart = typeIdStart + 3;

        this.BinaryString = binStr;
        this.Version = this.getIntVal(startIndex, typeIdStart);
        this.TypeId =  this.getIntVal(typeIdStart, contentStart);

        this.ContentStart = contentStart;
        this.SourceStr = binStr;

        this.SubPackets = [];
        this.LiteralValue = null;

        this.parseContent();
        
    }

    parseContent() {
        if (this.isLiteral()) {
            this.parseLiteral();
        } else {
            this.parseOperator();
        }
    }

    parseLiteral() {
        const literalSize = 5;
        let curStart = this.ContentStart;
        let literalVal = 0;
        let isLast = false;
        
        let strAcc = [];
        while (!isLast) {
            isLast = this.BinaryString[curStart] == '0';
            const nextStart = curStart + literalSize;
            strAcc.push(this.BinaryString.slice(curStart + 1, nextStart));
            
            curStart = nextStart;
        }
        const literalBinary = strAcc.join('');

        this.LiteralValue = parseInt(literalBinary, 2);
        this.FirstBitAfterContent = curStart;
    }

    parseOperator() {
        const lengthTypeId = parseInt(this.BinaryString[this.ContentStart]);
        this.LengthValueStart = this.ContentStart + 1;
 
        if (lengthTypeId == 0) {
            this.parseBySubPacketsLength();
        } else {
            this.parseByNumberSubpackets();
        }
    }

    parseBySubPacketsLength() {
        this.SubPacketsStart = this.LengthValueStart + 15;
        const subPacketsLength = this.getIntVal(this.LengthValueStart, this.SubPacketsStart);
        this.FirstBitAfterContent = this.SubPacketsStart + subPacketsLength;
        let curPacketStart = this.SubPacketsStart;
        while (curPacketStart < this.FirstBitAfterContent) {
            curPacketStart = this.addSubPacket(curPacketStart).FirstBitAfterContent;
        }
    }

    parseByNumberSubpackets() {
        this.SubPacketsStart = this.LengthValueStart + 11;
        const numSubPackets = this.getIntVal(this.LengthValueStart, this.SubPacketsStart);

        let curPacketStart = this.SubPacketsStart;
        for (let i = 0; i < numSubPackets; i++) {
            curPacketStart = this.addSubPacket(curPacketStart).FirstBitAfterContent;
        }
        this.FirstBitAfterContent = curPacketStart;
    }

    addSubPacket(packetStart) {
        const nextPacket = new Packet(this.BinaryString, packetStart);
        this.SubPackets.push(nextPacket);
        return nextPacket
    }

    isLiteral() {
        return this.TypeId == 4;
    }

    getIntVal(start, end) {
        const binVal = this.BinaryString.slice(start, end);
        return parseInt(binVal, 2);
    }

    getValue() {
        switch(this.TypeId) {
            case 0: 
                return this.getSumSubpackets();
            case 1:
                return this.getProductSubpackets();
            case 2: 
                return this.getMinPackets();
            case 3:
                return this.getMaxPackets();
            case 4:
                return this.LiteralValue;
            case 5:
                return this.getGreaterThan();
            case 6: 
                return this.getLessThan();
            case 7:
                return this.getEqual();
            default:
                return null;
        }
    }

    getSumSubpackets() {
        return this.getAggregateSubpackets((a, b) => a + b);
    }

    getProductSubpackets() {
        return this.getAggregateSubpackets((a, b) => a * b);
    }

    getMinPackets() {
        return this.getAggregateSubpackets((a, b) => Math.min(a, b));
    }

    getMaxPackets() {
        return this.getAggregateSubpackets((a, b) => Math.max(a, b));
    }

    getGreaterThan() {
        return this.getFirstTwoSubpacketsOp((a, b) => a > b ? 1 : 0);
    }

    getLessThan() {
        return this.getFirstTwoSubpacketsOp((a, b) => a < b ? 1 : 0);
    }

    getEqual() {
        return this.getFirstTwoSubpacketsOp((a, b) => a == b ? 1 : 0);
    }

    getAggregateSubpackets(reducer, defaultValue=0) {
        return this.SubPackets.length > 0 ? this.SubPackets.map(p => p.getValue()).reduce(reducer) : defaultValue;
    }

    getFirstTwoSubpacketsOp(operatorFunc) {
        return this.SubPackets.length >= 2 ? operatorFunc(this.SubPackets[0].getValue(), this.SubPackets[1].getValue()) : null;
    } 

    getVersionNumberSum() {
        return this.Version + this.SubPackets.reduce((sum, p) => sum + p.getVersionNumberSum(), 0);
    }
}

class PacketDecoder extends CalculationModel {
    constructor(hexStr) {
        super();

        const binStr = hexStr.split('').map(hexDigit => parseInt(hexDigit, 16).toString(2).padStart(4, '0')).join('');

        this.BinaryString = binStr;

        this.OuterPacket = new Packet(this.BinaryString, 0);
    }

    
    getVersionNumberSum() {
        return this.OuterPacket.getVersionNumberSum();
    }

    getValue() {
        return this.OuterPacket.getValue();
    }
}

class PacketDecoderController extends CalculationController {

}

window.solution = {
    partA: function ({ model, calcParams }) {
        return model.getVersionNumberSum();
    },
    partB: function ({ model, calcParams }) {
        return model.getValue();
    },
    createModel: function (str) {
        return new PacketDecoder(str);
    },
    createController: function (model, parentElement, visualParams) {
        return new PacketDecoderController(model, parentElement, visualParams);
    },
    hasVisual: false
}