
"use strict";

var ResumeContent = function (from,nameHash,resume,resumeHash) {
    this.owner = from;
    this.resume = resume;
    this.resumeHash = resumeHash;
    this.nameHash=nameHash;
};

ResumeContent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ResumeContract = function () {
    LocalContractStorage.defineMapProperty(this, "resumedb", {
        parse: function (text) {
            return new ResumeContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};


ResumeContract.prototype = {
    init: function () {
    },

    save: function (data) {
        var from = Blockchain.transaction.from;
        var fData = this.resumedb.get(data.nameHash);
        if ((fData && fData.owner == from) || fData==null) {
            var resumeContent = new ResumeContent(from,data.nameHash,data.resume,data.resumeHash);
            this.resumedb.put(data.nameHash, JSON.stringify(resumeContent));
        }else{
            throw new Error("Cannot update this resume.");
        }
    },
    testS:function(data){ return this.resumedb.get(data);},
    testNameHashInput(data){
        return data.nameHash;
    },
    testNameHashTest(data){
        return data;
    },
    query: function (nameHash) {
        var from = Blockchain.transaction.from;
        var resumeContent = JSON.parse(this.resumedb.get(nameHash));

        if(resumeContent==null){
            throw new Error("No resume before.");
        }

        if(from==resumeContent.owner){
            return resumeContent;
        }else{
            return resumeContent.resumeHash;
        }
    }
};
module.exports = ResumeContract;