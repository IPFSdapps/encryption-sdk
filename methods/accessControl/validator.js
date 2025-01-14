const Joi = require("joi");

const solidityType = [
  "address",
  "address[]",
  "bool",
  "bool[]",
  "bytes1",
  "bytes2",
  "bytes3",
  "bytes4",
  "bytes5",
  "bytes6",
  "bytes7",
  "bytes8",
  "bytes16",
  "bytes32",
  "bytes1[]",
  "bytes2[]",
  "bytes3[]",
  "bytes4[]",
  "bytes5[]",
  "bytes6[]",
  "bytes7[]",
  "bytes8[]",
  "bytes16[]",
  "bytes32[]",
  "uint8",
  "uint16",
  "uint24",
  "uint32",
  "uint40",
  "uint48",
  "uint64",
  "uint128",
  "uint192",
  "uint256",
  "int8",
  "int16",
  "int24",
  "int32",
  "int40",
  "int48",
  "int64",
  "int128",
  "int192",
  "int256",
  "uint8[]",
  "uint16[]",
  "uint24[]",
  "uint32[]",
  "uint40[]",
  "uint48[]",
  "uint64[]",
  "uint128[]",
  "uint192[]",
  "uint256[]",
  "int8[]",
  "int16[]",
  "int24[]",
  "int32[]",
  "int40[]",
  "int48[]",
  "int64[]",
  "int128[]",
  "int192[]",
  "int256[]",
];

const SupportedChains = {
  EVM: [
    "Ethereum",
    "Rinkeby",
    "Polygon",
    "Fantom",
    "FantomTest",
    "AVAX",
    "Fuji",
    "BSC",
    "BSCTest",
    "Optimism",
    "OptimismGoerli",
    "OptimismKovan",
    "Mumbai",
    "FVM",
    "Wallaby",
    "Calibration",
    "Shardeum",
    "Shardeum_Lib1",
    "Shardeum_Lib2",
  ],
  SOLANA: ["DEVNET", "TESTNET", "MAINNET"],
};

const evmConditions = Joi.array()
  .min(1)
  .required()
  .items(
    Joi.object({
      id: Joi.number().min(1).required(),
      standardContractType: Joi.string()
        .valid("ERC20", "ERC721", "ERC1155", "Custom", "")
        .insensitive()
        .required(),
      contractAddress: Joi.when("standardContractType", {
        is: Joi.equal(""),
        then: Joi.string(),
        otherwise: Joi.string().required(),
      }),
      chain: Joi.string()
        .valid(...SupportedChains["EVM"])
        .insensitive()
        .required(),
      method: Joi.when("standardContractType", {
        is: Joi.equal(""),
        then: Joi.string().valid("getBalance", "getBlockNumber").required(),
        otherwise: Joi.string().required(),
      }),
      parameters: Joi.when("standardContractType", {
        is: Joi.equal(""),
        then: Joi.array(),
        otherwise: Joi.array().required(),
      }),
      returnValueTest: Joi.object({
        comparator: Joi.string()
          .valid("==", ">=", "<=", "!=", ">", "<")
          .required(),
        value: Joi.alternatives(
          Joi.number(),
          Joi.string(),
          Joi.array()
        ).required(),
      }).required(),
      inputArrayType: Joi.when("standardContractType", {
        is: Joi.equal("Custom"),
        then: Joi.array()
          .items(Joi.string().valid(...solidityType))
          .required(),
      }),
      outputType: Joi.when("standardContractType", {
        is: Joi.equal("Custom"),
        then: Joi.string()
          .valid(...solidityType)
          .required(),
      }),
    })
  )
  .unique((a, b) => a.id === b.id);

const solanaConditions = Joi.array()
  .min(1)
  .required()
  .items(
    Joi.object({
      id: Joi.number().min(1).required(),
      contractAddress: Joi.when("standardContractType", {
        is: Joi.equal(""),
        then: Joi.string(),
        otherwise: Joi.string().required(),
      }),
      chain: Joi.string()
        .valid(...SupportedChains["SOLANA"])
        .insensitive()
        .required(),
      method: Joi.when("standardContractType", {
        is: Joi.equal(""),
        then: Joi.string()
          .valid("getBalance", "getLastBlockTime", "getBlockHeight")
          .required(),
        otherwise: Joi.string().valid("getTokenAccountsByOwner").required(),
      }),
      standardContractType: Joi.string()
        .valid("spl-token", "")
        .insensitive()
        .required(),
      parameters: Joi.when("standardContractType", {
        is: Joi.equal(""),
        then: Joi.array(),
        otherwise: Joi.array(),
      }),
      pdaInterface: Joi.object({
        offset: Joi.number().min(0),
        selector: Joi.string(),
      }).required(),
      returnValueTest: Joi.object({
        comparator: Joi.string()
          .valid("==", ">=", "<=", "!=", ">", "<")
          .required(),
        value: Joi.alternatives(
          Joi.number(),
          Joi.string(),
          Joi.array()
        ).required(),
      }).required(),
    })
  )
  .unique((a, b) => a.id === b.id);

const updateConditionSchema = Joi.object({
  chainType: Joi.string()
    .allow("", null)
    .empty(["", null])
    .default("EVM")
    .valid("EVM", "SOLANA")
    .insensitive(),
  conditions: Joi.when("chainType", {
    is: Joi.equal("EVM"),
    then: evmConditions,
    otherwise: solanaConditions,
  }),
  address: Joi.string().required(),
  cid: Joi.string().required(),
  // TO aggregator next iteration: "1 or 2 and (3 xor 4)"
  aggregator: Joi.when("conditions.length", {
    is: Joi.number().greater(1),
    then: Joi.string()
      .pattern(/( and | or )/i)
      .required(),
  }),
});

module.exports = {
  updateConditionSchema,
};
