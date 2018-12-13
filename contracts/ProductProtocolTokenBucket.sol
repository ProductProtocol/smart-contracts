pragma solidity ^0.4.25;
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./mixins/RBACMixin.sol";

interface IMintableToken {
  function mint(address _to, uint256 _amount) external returns (bool);
}


/// @title Very simplified implementation of Token Bucket Algorithm to secure token minting
/// @author Mai Abha <maiabha82@gmail.com>
/// @notice Works with tokens implemented Mintable interface
/// @dev Transfer ownership/minting role to contract and execute mint over ProductProtocolTokenBucket proxy to secure
contract ProductProtocolTokenBucket is RBACMixin, IMintableToken {
  using SafeMath for uint;

  /// @notice Limit maximum amount of available for minting tokens when bucket is full
  /// @dev Should be enough to mint tokens with proper speed but less enough to prevent overminting in case of losing pkey
  uint256 public size;
  /// @notice Bucket refill rate
  /// @dev Tokens per second (based on block.timestamp). Amount without decimals (in smallest part of token)
  uint256 public rate;
  /// @notice Stored time of latest minting
  /// @dev Each successful call of minting function will update field with call timestamp
  uint256 public lastMintTime;
  /// @notice Left tokens in bucket on time of latest minting
  uint256 public leftOnLastMint;

  /// @notice Reference of Mintable token
  /// @dev Setup in contructor phase and never change in future
  IMintableToken public token;

  /// @notice Token Bucket leak event fires on each minting
  /// @param to is address of target tokens holder
  /// @param left is amount of tokens available in bucket after leak
  event Leak(address indexed to, uint256 left);

  /// @param _token is address of Mintable token
  /// @param _size initial size of token bucket
  /// @param _rate initial refill rate (tokens/sec)
  constructor (address _token, uint256 _size, uint256 _rate) public {
    token = IMintableToken(_token);
    size = _size;
    rate = _rate;
    leftOnLastMint = _size;
  }

  /// @notice Change size of bucket
  /// @dev Require owner role to call
  /// @param _size is new size of bucket
  /// @return A boolean that indicates if the operation was successful.
  function setSize(uint256 _size) public onlyOwner returns (bool) {
    size = _size;
    return true;
  }

  /// @notice Change refill rate of bucket
  /// @dev Require owner role to call
  /// @param _rate is new refill rate of bucket
  /// @return A boolean that indicates if the operation was successful.
  function setRate(uint256 _rate) public onlyOwner returns (bool) {
    rate = _rate;
    return true;
  }

  /// @notice Change size and refill rate of bucket
  /// @dev Require owner role to call
  /// @param _size is new size of bucket
  /// @param _rate is new refill rate of bucket
  /// @return A boolean that indicates if the operation was successful.
  function setSizeAndRate(uint256 _size, uint256 _rate) public onlyOwner returns (bool) {
    return setSize(_size) && setRate(_rate);
  }

  /// @notice Function to mint tokens
  /// @param _to The address that will receive the minted tokens.
  /// @param _amount The amount of tokens to mint.
  /// @return A boolean that indicates if the operation was successful.
  function mint(address _to, uint256 _amount) public onlyMinter returns (bool) {
    uint256 available = availableTokens();
    require(_amount <= available);
    leftOnLastMint = available.sub(_amount);
    lastMintTime = now; // solium-disable-line security/no-block-members
    require(token.mint(_to, _amount));
    return true;
  }

  /// @notice Function to calculate and get available in bucket tokens
  /// @return An amount of available tokens in bucket
  function availableTokens() public view returns (uint) {
     // solium-disable-next-line security/no-block-members
    uint256 timeAfterMint = now.sub(lastMintTime);
    uint256 refillAmount = rate.mul(timeAfterMint).add(leftOnLastMint);
    return size < refillAmount ? size : refillAmount;
  }
}