pragma solidity ^0.4.25;
import "../mixins/RBACMixin.sol";


contract RBACMock is RBACMixin {
  event MinterAccess(address indexed who);
  event OnwerAccess(address indexed who);
 
  function requireOwnerAndMinterRoles() public view {
    requireOwnerRole();
    requireMinterRole();
  }

  function requireOwnerRole() onlyOwner public view {
    // do nothing
  }
  
  function requireMinterRole() onlyMinter public view {
    // do nothing
  }  
}