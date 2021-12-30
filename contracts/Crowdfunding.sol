pragma solidity >=0.4.21 <0.7.0;


contract Crowdfunding {
    // author
    address public author;

    // joined amount
    mapping(address => uint) public joined;

    // crowdfunding target
    uint constant Target = 10 ether;

    uint public endTime;

    // record current crowdfunding price
    uint public price  = 0.02 ether ;

    // end crowdfunding, after author withdraw funds
    bool public closed = false;

    // address[] joinAccouts;
    event Join(address indexed user, uint price);

    constructor() public {
        author = msg.sender;
        endTime = now + 30 days;
    }

    // update price
    function updatePrice() internal {
        uint rise = address(this).balance / 1 ether * 0.002 ether;
        price = 0.02 ether + rise;
    }

    function () external payable {
        require(now < endTime && !closed  , "Crowdfunding is over");
        require(joined[msg.sender] == 0 , "You have participated in crowdfunding");

        require (msg.value >= price, "Bid too low");
        joined[msg.sender] = msg.value;

        updatePrice();

        emit Join(msg.sender, msg.value);     //  48820  gas
        // joinAccouts.push(msg.sender);   // 88246  gas
    }

    // author withdraw funds
    function withdrawFund() external {
        require(msg.sender == author, "You are not project owner");
        require(address(this).balance >= Target, "Did not meet the crowdfunding goal");
        closed = true;
        msg.sender.transfer(address(this).balance);
    }

    // reader withdraw funds
    function withdraw() external {
        require(now > endTime, "It's not yet the end of crowdfunding");
        require(!closed, "Crowdfunding reaches the standard, and the crowdfunding funds have been withdrawn");
        require(Target > address(this).balance, "Crowdfunding meets the standard, you can't withdraw funds");

        msg.sender.transfer(joined[msg.sender]);
    }

}
