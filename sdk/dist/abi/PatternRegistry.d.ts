export declare const PatternRegistryABI: readonly [{
    readonly type: "function";
    readonly name: "patterns";
    readonly inputs: readonly [{
        readonly name: "_id";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
    }, {
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly name: "stake";
        readonly type: "uint256";
    }, {
        readonly name: "reputation";
        readonly type: "uint256";
    }, {
        readonly name: "registrationTime";
        readonly type: "uint256";
    }, {
        readonly name: "usageCount";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "isRegistered";
    readonly inputs: readonly [{
        readonly name: "_id";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "minStake";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getPattern";
    readonly inputs: readonly [{
        readonly name: "_id";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "id";
            readonly type: "bytes32";
        }, {
            readonly name: "owner";
            readonly type: "address";
        }, {
            readonly name: "stake";
            readonly type: "uint256";
        }, {
            readonly name: "reputation";
            readonly type: "uint256";
        }, {
            readonly name: "registrationTime";
            readonly type: "uint256";
        }, {
            readonly name: "usageCount";
            readonly type: "uint256";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "MAX_REPUTATION";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "owner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "registerPattern";
    readonly inputs: readonly [{
        readonly name: "_id";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "recordUsage";
    readonly inputs: readonly [{
        readonly name: "_id";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "slashStake";
    readonly inputs: readonly [{
        readonly name: "_id";
        readonly type: "bytes32";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
    }, {
        readonly name: "_reason";
        readonly type: "string";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setMinStake";
    readonly inputs: readonly [{
        readonly name: "_newMinStake";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "event";
    readonly name: "PatternRegistered";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "stake";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "PatternUsed";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "user";
        readonly type: "address";
        readonly indexed: true;
    }];
}, {
    readonly type: "event";
    readonly name: "StakeSlashed";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly name: "reason";
        readonly type: "string";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "ReputationUpdated";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "newReputation";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}];
