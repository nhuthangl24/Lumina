const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/room/VirtualRoomWidget.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
`                    </button>
                  </>
                    </button>
                  </>
                )}`, 
`                    </button>
                  </>
                )}`
);

fs.writeFileSync(filePath, content);
console.log("Syntax fixed in VirtualRoomWidget.tsx");
