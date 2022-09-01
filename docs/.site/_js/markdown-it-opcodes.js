// markdown-it rules to improve the opcode table and listings in isa.md.

// Simple state machine to detect whether we're inside a container,
// by looking at open and close tags while iterating over a flat token strea.m
const groupFilter = (groupName) => {
  const startType = groupName + "_open";
  const endType = groupName + "_close";
  let flag = false;
  return (token) => {
    if (token.type == startType) {
      flag = true;
      return false;
    }
    if (!flag || token.type == endType) {
      return (flag = false);
    }
    return true;
  };
};

// Simple state machine to detect column of table.
function newColumnTracker() {
  let column = -1;
  return (token) => {
    const tokenType = token.type;
    if (tokenType == "tr_open" || tokenType == "tr_close") {
      column = -1;
    } else if (tokenType == "td_open") {
      column++;
    } else if (tokenType == "inline") {
      return column;
    }
  };
}

// Wraps an inline token in an "a" tag.
function makeLink(token, attrs, text) {
  token.block = true;
  token.children = [
    {
      type: "link_open",
      tag: "a",
      attrs: attrs,
    },
    {
      type: "text",
      content: text || token.content,
    },
    {
      type: "link_close",
      tag: "a",
    },
  ];
  token.content = "";
}

module.exports = function (md) {
  // Step 1: Create anchors from the opcode names in the opcode listings
  function opcodeToAnchorLink(token) {
    makeLink(token, [["name", token.content]]);
  }

  // Step 2: Create local refs from the opcode table to the anchors from step 1
  function opcodeToRefLink(token) {
    if (token.content == "-") {
      return;
    }
    makeLink(token, [["href", "#" + token.content]]);
  }

  // Create local refs from syscall listing to detail sections
  function syscallToRefLink(token) {
    const content = token.content;
    token.content = `[${content}](#${content.slice(1, -1)})`;
  }

  md.core.ruler.after("block", "opcode_listing_anchors", function (state) {
    const inOpcodeListing = groupFilter("container_opcode_listing");
    const inOpcodeTable = groupFilter("container_opcode_table");
    const inSyscallListing = groupFilter("container_syscall_listing");
    const inTbody = groupFilter("tbody");
    const getColumn = newColumnTracker();

    for (const token of state.tokens) {
      const column = getColumn(token);
      if (inOpcodeListing(token) && inTbody(token) && column == 1) {
        opcodeToAnchorLink(token);
      } else if (inOpcodeTable(token) && inTbody(token) && column > 1) {
        opcodeToRefLink(token);
      } else if (inSyscallListing(token) && inTbody(token) && column == 1) {
        syscallToRefLink(token);
      }
    }
  });
};
