pragma solidity ^0.4.25;
import "../mixins/ERC223ReceiverMixin.sol";


contract ERC223ReceiverMock is ERC223ReceiverMixin {
  event Fallback(address indexed _from, uint256 _value, bytes _data);

  function tokenFallback(address _from, uint256 _value, bytes _data) public {
    emit Fallback(_from, _value, _data);
  }
}