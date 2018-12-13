pragma solidity ^0.4.25;


/// @title Role based access control mixin for Product Protocol Platform
/// @author Mai Abha <maiabha82@gmail.com>
/// @dev Ignore DRY approach to achieve readability
contract RBACMixin {
  /// @notice Constant string message to throw on lack of access
  string constant FORBIDDEN = "Haven't enough right to access";
  /// @notice Public map of owners
  mapping (address => bool) public owners;
  /// @notice Public map of minters
  mapping (address => bool) public minters;

  /// @notice The event indicates the addition of a new owner
  /// @param who is address of added owner
  event AddOwner(address indexed who);
  /// @notice The event indicates the deletion of an owner
  /// @param who is address of deleted owner
  event DeleteOwner(address indexed who);

  /// @notice The event indicates the addition of a new minter
  /// @param who is address of added minter
  event AddMinter(address indexed who);
  /// @notice The event indicates the deletion of a minter
  /// @param who is address of deleted minter
  event DeleteMinter(address indexed who);

  constructor () public {
    _setOwner(msg.sender, true);
  }

  /// @notice The functional modifier rejects the interaction of senders who are not owners
  modifier onlyOwner() {
    require(isOwner(msg.sender), FORBIDDEN);
    _;
  }

  /// @notice Functional modifier for rejecting the interaction of senders that are not minters
  modifier onlyMinter() {
    require(isMinter(msg.sender), FORBIDDEN);
    _;
  }

  /// @notice Look up for the owner role on providen address
  /// @param _who is address to look up
  /// @return A boolean of owner role
  function isOwner(address _who) public view returns (bool) {
    return owners[_who];
  }

  /// @notice Look up for the minter role on providen address
  /// @param _who is address to look up
  /// @return A boolean of minter role
  function isMinter(address _who) public view returns (bool) {
    return minters[_who];
  }

  /// @notice Adds the owner role to provided address
  /// @dev Requires owner role to interact
  /// @param _who is address to add role
  /// @return A boolean that indicates if the operation was successful.
  function addOwner(address _who) public onlyOwner returns (bool) {
    _setOwner(_who, true);
  }

  /// @notice Deletes the owner role to provided address
  /// @dev Requires owner role to interact
  /// @param _who is address to delete role
  /// @return A boolean that indicates if the operation was successful.
  function deleteOwner(address _who) public onlyOwner returns (bool) {
    _setOwner(_who, false);
  }

  /// @notice Adds the minter role to provided address
  /// @dev Requires owner role to interact
  /// @param _who is address to add role
  /// @return A boolean that indicates if the operation was successful.
  function addMinter(address _who) public onlyOwner returns (bool) {
    _setMinter(_who, true);
  }

  /// @notice Deletes the minter role to provided address
  /// @dev Requires owner role to interact
  /// @param _who is address to delete role
  /// @return A boolean that indicates if the operation was successful.
  function deleteMinter(address _who) public onlyOwner returns (bool) {
    _setMinter(_who, false);
  }

  /// @notice Changes the owner role to provided address
  /// @param _who is address to change role
  /// @param _flag is next role status after success
  /// @return A boolean that indicates if the operation was successful.
  function _setOwner(address _who, bool _flag) private returns (bool) {
    require(owners[_who] != _flag);
    owners[_who] = _flag;
    if (_flag) {
      emit AddOwner(_who);
    } else {
      emit DeleteOwner(_who);
    }
    return true;
  }

  /// @notice Changes the minter role to provided address
  /// @param _who is address to change role
  /// @param _flag is next role status after success
  /// @return A boolean that indicates if the operation was successful.
  function _setMinter(address _who, bool _flag) private returns (bool) {
    require(minters[_who] != _flag);
    minters[_who] = _flag;
    if (_flag) {
      emit AddMinter(_who);
    } else {
      emit DeleteMinter(_who);
    }
    return true;
  }
}