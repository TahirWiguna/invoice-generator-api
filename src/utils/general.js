const formatter = new Intl.NumberFormat(process.env.FORMATTER, {
  style: "currency",
  currency: process.env.FORMATTER_CURRENCY,
});

const format = (money) => {
  return formatter.format(money);
};

module.exports = { formatter, format };
