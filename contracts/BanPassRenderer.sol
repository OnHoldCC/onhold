// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// Immutable renderer: no external image host, admin setters or mutable metadata.
contract BanPassRenderer {
    using Strings for uint256;

    function _lines(string memory value, uint256 width) private pure returns (string memory) {
        bytes memory input = bytes(value);
        string memory output = '<tspan x="48" dy="0">';
        uint256 count;
        for (uint256 i; i < input.length; i++) {
            bytes1 c = input[i];
            if (uint8(c) & 0xc0 != 0x80) {
                if (count > 0 && count % width == 0) output = string.concat(output, '</tspan><tspan x="48" dy="29">');
                count++;
            }
            if (c == '&') output = string.concat(output, '&amp;');
            else if (c == '<') output = string.concat(output, '&lt;');
            else if (c == '>') output = string.concat(output, '&gt;');
            else output = string.concat(output, uint8(c) < 32 ? ' ' : string(abi.encodePacked(c)));
        }
        return string.concat(output, '</tspan>');
    }

    function _timestamp(string calldata value) private pure returns (string memory) {
        bytes memory raw = bytes(value);
        if (raw.length < 19 || raw[10] != 'T') return value;
        bytes memory display = new bytes(19);
        for (uint256 i; i < 19; i++) display[i] = i == 10 ? bytes1(' ') : raw[i];
        return string(display);
    }

    function tokenURI(uint256 tokenId, uint8 tier, string calldata account, string calldata uuid, string calldata bannedAt, string calldata previousPlan) external pure returns (string memory) {
        string memory plan = tier == 1 ? "Pro" : "Max";
        string memory weight = tier == 1 ? "1" : "3";
        string memory color = tier == 1 ? "#c36948" : "#625785";
        string memory header = string.concat('<svg xmlns="http://www.w3.org/2000/svg" width="840" height="924" viewBox="0 0 840 924"><rect x="1" y="1" width="838" height="922" rx="38" fill="#f7f4ed" stroke="#d4cec4" stroke-width="2"/><g font-family="Nunito,ui-rounded,system-ui,sans-serif" fill="#33312e"><g transform="translate(48 46) scale(4)" shape-rendering="crispEdges"><path fill="#d97757" d="M3 1h7v1h2v2h1v3h-2v2h-1v2H9V9H8v2H7V9H6v2H5V9H4v2H3V9H2V7H0V4h1V2h2Z"/><path fill="#2d2926" d="M3 4h1v2H3zm6 0h1v2H9z"/></g><text x="108" y="77" font-size="23" font-weight="700">Claude Code</text><text x="790" y="77" text-anchor="end" fill="', color, '" font-size="23" font-weight="700">', plan, '</text><text x="48" y="131" fill="#77726a" font-size="17" letter-spacing="2">BAN PASS / ACCOUNT RECORD</text><g transform="rotate(-5 420 213)"><rect x="48" y="163" width="744" height="102" rx="16" fill="none" stroke="', color, '" stroke-width="3"/><text x="420" y="238" text-anchor="middle" fill="', color, '" font-size="76" letter-spacing="9" font-weight="800">BANNED</text></g>');
        string memory fields = string.concat('<g font-family="monospace" fill="#77726a" font-size="15" letter-spacing="1"><text x="48" y="325">ACCOUNT</text><text x="48" y="521">PREVIOUS PLAN</text><text x="48" y="653">BANNED AT (UTC)</text><text x="48" y="769">UUID</text></g><g font-size="22" font-weight="600"><text x="48" y="360">', _lines(account, 32), '</text><text x="48" y="556">', _lines(previousPlan, 32), '</text><text x="48" y="688" font-family="monospace" font-size="20">', _lines(_timestamp(bannedAt), 48), '</text><text x="48" y="805" font-family="monospace" font-size="22">', _lines(uuid, 40), '</text></g>');
        string memory artwork = string.concat(header, fields, '<path d="M48 849H792" stroke="#d4cec4"/><text x="48" y="891" font-size="16" fill="#77726a">PERMANENT ON-CHAIN RECORD</text><text x="792" y="891" text-anchor="end" font-size="20" font-weight="700">WEIGHT ', weight, '</text></g></svg>');
        string memory traits = string.concat('{"trait_type":"Account","value":"', Strings.escapeJSON(account), '"},{"trait_type":"UUID","value":"', Strings.escapeJSON(uuid), '"},{"trait_type":"Banned at","value":"', Strings.escapeJSON(bannedAt), '"},{"trait_type":"Previous plan","value":"', Strings.escapeJSON(previousPlan), '"}');
        return string.concat('data:application/json;base64,', Base64.encode(bytes(string.concat('{"name":"Claude Code ', plan, ' Pass #', tokenId.toString(), '","description":"A permanent public record of a verified restricted Claude account. Stake this NFT to mine $Claude.","image":"data:image/svg+xml;base64,', Base64.encode(bytes(artwork)), '","attributes":[{"trait_type":"Plan","value":"', plan, '"},{"trait_type":"Mining weight","value":', weight, '},', traits, ']}'))));
    }
}
