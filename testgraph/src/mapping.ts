import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/AdventCalendarToken/AdventCalendarToken";
import { AccountTokenBalance } from "../generated/schema";

// Transferのイベントが発火された時に実行されるfunction
export function handleTransfer(event: Transfer): void {
  let tokenId = event.address.toHex();
  let toAddress = event.params.to.toHex();
  let toAccount = AccountTokenBalance.load(toAddress);
  if (toAccount == null) {
    toAccount = new AccountTokenBalance(toAddress);
    toAccount.balance = BigInt.fromI32(0);
  }
  toAccount.balance = toAccount.balance.plus(event.params.value);
  toAccount.token = tokenId;
  toAccount.save();

  let fromAddress = event.params.from.toHex();
  if (fromAddress == "0x0000000000000000000000000000000000000000") {
    return;
  }

  let fromAccount = AccountTokenBalance.load(fromAddress);
  if (fromAccount == null) {
    fromAccount = new AccountTokenBalance(fromAddress);
    fromAccount.balance = BigInt.fromI32(0);
  }
  fromAccount.balance = fromAccount.balance.minus(event.params.value);
  fromAccount.token = tokenId;
  fromAccount.save();
}
