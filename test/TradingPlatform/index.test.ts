describe("TradingPlatform: ", () => {
  require("./constructor.test");
  require("./removeTokensFromWhitelist.test");
  require("./deposit.test");
  require("./withdraw.test");
  require("./createOrder.test");
  require("./cancelOrders.test");
  require("./boundOrders.test");
  require("./checkOrder.test");
  require("./shouldRebalance.test");
  require("./checkUpkeep.test");
  require("./executeOrders.test");
  require("./performUpkeep.test");
});
