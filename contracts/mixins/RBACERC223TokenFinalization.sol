pragma solidity ^0.4.25;
import "./RBACMixin.sol";
import "./ERC223Mixin.sol";


/// @title Role based token finalization mixin
/// @author Mai Abha <maiabha82@gmail.com>
contract RBACERC223TokenFinalization is ERC223Mixin, RBACMixin {
  event Finalize();
  /// @notice Public field inicates the finalization state of smart-contract
  bool public finalized;

  /// @notice The functional modifier rejects the interaction if contract isn't finalized
  modifier isFinalized() {
    require(finalized);
    _;
  }

  /// @notice The functional modifier rejects the interaction if contract is finalized
  modifier notFinalized() {
    require(!finalized);
    _;
  }

  /// @notice Finalizes contract
  /// @dev Requires owner role to interact
  /// @return A boolean that indicates if the operation was successful.
  function finalize() public notFinalized onlyOwner returns (bool) {
    finalized = true;
    emit Finalize();
    return true;
  }

  /// @dev Overrides ERC20 interface to prevent interaction before finalization
  function transferFrom(address _from, address _to, uint256 _value) public isFinalized returns (bool) {
    return super.transferFrom(_from, _to, _value);
  }

  /// @dev Overrides ERC223 interface to prevent interaction before finalization
  // solium-disable-next-line arg-overflow
  function transferFrom(address _from, address _to, uint256 _value, bytes _data) public isFinalized returns (bool) {
    return super.transferFrom(_from, _to, _value, _data); // solium-disable-line arg-overflow
  }

  /// @dev Overrides ERC223 interface to prevent interaction before finalization
  function transfer(address _to, uint256 _value, bytes _data) public isFinalized returns (bool) {
    return super.transfer(_to, _value, _data);
  }

  /// @dev Overrides ERC20 interface to prevent interaction before finalization
  function transfer(address _to, uint256 _value) public isFinalized returns (bool) {
    return super.transfer(_to, _value);
  }

  /// @dev Overrides ERC20 interface to prevent interaction before finalization
  function approve(address _spender, uint256 _value) public isFinalized returns (bool) {
    return super.approve(_spender, _value);
  }

  /// @dev Overrides ERC20 interface to prevent interaction before finalization
  function increaseApproval(address _spender, uint256 _addedValue) public isFinalized returns (bool) {
    return super.increaseApproval(_spender, _addedValue);
  }

  /// @dev Overrides ERC20 interface to prevent interaction before finalization
  function decreaseApproval(address _spender, uint256 _subtractedValue) public isFinalized returns (bool) {
    return super.decreaseApproval(_spender, _subtractedValue);
  }
}