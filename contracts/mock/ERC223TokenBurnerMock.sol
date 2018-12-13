pragma solidity ^0.4.25;

import "../mixins/ERC223ReceiverMixin.sol";


contract ERC223TokenBurnerMock {

  event BurnMock(uint256 amount);

  ERC223ReceiverMixin public receiver;
  function setReceiver(address _receiver) public {
    receiver = ERC223ReceiverMixin(_receiver);
  }

  function triggerFallback(address _from, uint256 _value, bytes _data) public {
    emit BurnMock(_value);
    receiver.tokenFallback(_from, _value, _data); 
  }

  function burn(uint256 _amount) public returns (bool) {
    emit BurnMock(_amount);
    return true;
  }
}
