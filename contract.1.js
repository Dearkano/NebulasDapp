
"use strict";

var ResumeContent = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.resumeHash = text.resumeHash;
        this.resume = text.resume;
        this.owner = text.address;
        this.nameHash = text.nameHash;
    } else {
        this.resume = "";
        this.resumeHash = "";
        this.owner = "";
        this.nameHash="";
    }
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

    save: function (jsonstr) {
        var from = Blockchain.transaction.from;
        var data1 = JSON.parse(jsonstr);
        var data = data1[0];
        var owner = this.resumedb.get(from);
        if ((owner && owner == from) || owner=="") {
            var resumeContent = new ResumeContent();
            resumeContent.owner = from;
            resumeContent.resume = data.resume;
            resumeContent.resumeHash = data.resumeHash;
            resumeContent.nameHash=data.nameHash;
            this.resumedb.put(nameHash, JSON.stringify(resumeContent));
        }else{
            throw new Error("Cannot update this resume.");
        }
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