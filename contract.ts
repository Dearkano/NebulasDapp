'use strict';


class DepositeContent {
    constructor(text) {
        if (text) {
            var o = JSON.parse(text);
            this.balance = new BigNumber(o.balance);
            this.expiryHeight = new BigNumber(o.expiryHeight);
        } else {
            this.balance = new BigNumber(0);
            this.expiryHeight = new BigNumber(0);
        }
    }
    toString() {
        return JSON.stringify(this);
    }
}

export class BankVaultContract {
    constructor() {
        LocalContractStorage.defineMapProperty(this, "bankVault", {
            parse: function (text) {
                return new DepositeContent(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        //TODO:
    }

    save(height) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var bk_height = new BigNumber(Blockchain.block.height);

        var orig_deposit = this.bankVault.get(from);
        if (orig_deposit) {
            value = value.plus(orig_deposit.balance);
        }

        var deposit = new DepositeContent();
        deposit.balance = value;
        deposit.expiryHeight = bk_height.plus(height);

        this.bankVault.put(from, deposit);
    }

    takeout(value) {
        var from = Blockchain.transaction.from;
        var bk_height = new BigNumber(Blockchain.block.height);
        var amount = new BigNumber(value);

        var deposit = this.bankVault.get(from);
        if (!deposit) {
            throw new Error("No deposit before.");
        }

        if (bk_height.lt(deposit.expiryHeight)) {
            throw new Error("Can not takeout before expiryHeight.");
        }

        if (amount.gt(deposit.balance)) {
            throw new Error("Insufficient balance.");
        }

        var result = Blockchain.transfer(from, amount);
        if (!result) {
            throw new Error("transfer failed.");
        }
        Event.Trigger("BankVault", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: amount.toString()
            }
        });

        deposit.balance = deposit.balance.sub(amount);
        this.bankVault.put(from, deposit);
    }
    balanceOf() {
        var from = Blockchain.transaction.from;
        return this.bankVault.get(from);
    }
    verifyAddress(address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    }
}


