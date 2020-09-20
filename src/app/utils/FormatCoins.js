import {
  APP_NAME,
  LIQUID_TOKEN,
  LIQUID_TOKEN_UPPERCASE,
  DEBT_TOKEN,
  DEBT_TOKEN_SHORT,
  CURRENCY_SIGN,
  COINING_TOKEN
} from "app/client_config";

// TODO add comments and explanations
// TODO change name to formatCoinTypes?
// TODO make use of DEBT_TICKER etc defined in config/clietn_config
export function formatCoins(string) {
  // return null or undefined if string is not provided
  if (!string) return string;
  // TODO use .to:owerCase() ? for string normalisation
  string = string
    .replace("VSD", DEBT_TOKEN_SHORT)
    .replace("SD", DEBT_TOKEN_SHORT)
    .replace("Voilk Power", COINING_TOKEN)
    .replace("VOILK POWER", COINING_TOKEN)
    .replace("Voilk", LIQUID_TOKEN)
    .replace("VOILK", LIQUID_TOKEN_UPPERCASE)
    .replace("$", CURRENCY_SIGN);
  return string;
}
