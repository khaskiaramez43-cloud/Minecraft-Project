const Game = {
    selectedTool: null,
    selectedInventoryTile: null,

    inventory: {
        tree: 0,
        trunk: 0,
        rock: 0,
        dirt: 0,
        grass: 0
    },

    toolMatches: {
        axe: ["tree", "trunk"],
        pickaxe: ["rock"],
        shovel: ["dirt", "grass"]
    },

    initialWorld: [
        ["sky", "sky", "sky", "sky", "tree", "sky", "sky", "sky", "sky", "sky"],
        ["sky", "sky", "sky", "tree", "tree", "tree", "sky", "sky", "sky", "sky"],
        ["sky", "sky", "tree", "tree", "tree", "tree", "tree", "sky", "sky", "sky"],
        ["sky", "sky", "sky", "sky", "trunk", "sky", "sky", "rock", "sky", "sky"],
        ["sky", "sky", "sky", "sky", "trunk", "sky", "rock", "rock", "sky", "sky"],
        ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass"],
        ["dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt"],
        ["dirt", "dirt", "rock", "dirt", "dirt", "dirt", "rock", "dirt", "dirt", "dirt"],
        ["rock", "dirt", "rock", "dirt", "dirt", "rock", "rock", "dirt", "rock", "dirt"],
        ["rock", "rock", "rock", "dirt", "rock", "rock", "rock", "rock", "rock", "rock"]
    ],

    world: [],

    renderWorld() {
        const worldElement = document.querySelector(".world");

        worldElement.innerHTML = "";

        this.world.forEach((row, rowIndex) => {
            row.forEach((tileType, columnIndex) => {
                const tile = document.createElement("div");

                tile.classList.add("tile", `tile-${tileType}`);

                tile.dataset.row = rowIndex;
                tile.dataset.column = columnIndex;
                tile.dataset.type = tileType;

                tile.setAttribute("role", "button");
                tile.setAttribute("tabindex", "0");
                tile.setAttribute(
                    "aria-label",
                    `${tileType} tile at row ${rowIndex + 1}, column ${columnIndex + 1}`
                );

                tile.addEventListener("click", () => {
                    this.clickTile(rowIndex, columnIndex);
                });

                tile.addEventListener("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        this.clickTile(rowIndex, columnIndex);
                    }
                });

                worldElement.appendChild(tile);
            });
        });
    },

    clickTile(rowIndex, columnIndex) {
        const tileType = this.world[rowIndex][columnIndex];

        if (this.selectedInventoryTile) {
            this.placeFromInventory(rowIndex, columnIndex);
            return;
        }

        if (tileType === "sky") {
            return;
        }

        if (!this.selectedTool) {
            console.log("Select a tool first.");
            return;
        }

        const allowedTileTypes = this.toolMatches[this.selectedTool];

        if (!allowedTileTypes.includes(tileType)) {
            this.showWrongAction();
            return;
        }

        this.addToInventory(tileType);

        this.world[rowIndex][columnIndex] = "sky";

        this.renderWorld();
    },

    selectTool(toolButton) {
        const allToolButtons = document.querySelectorAll(".tool");

        allToolButtons.forEach((button) => {
            button.classList.remove("selected");
        });

        toolButton.classList.add("selected");

        this.selectedTool = toolButton.dataset.tool;

        this.selectedInventoryTile = null;
        this.renderInventory();

        console.log(`Selected tool: ${this.selectedTool}`);
    },

    setupToolEvents() {
        const toolButtons = document.querySelectorAll(".tool");

        toolButtons.forEach((button) => {
            button.addEventListener("click", () => {
                this.selectTool(button);
            });
        });
    },

    addToInventory(tileType) {
        this.inventory[tileType]++;

        this.renderInventory();
    },

    renderInventory() {
        const inventoryElement = document.querySelector(".inventory");

        inventoryElement.innerHTML = "";

        Object.entries(this.inventory).forEach(([tileType, amount]) => {
            if (amount === 0) {
                return;
            }

            const inventoryButton = document.createElement("button");

            inventoryButton.classList.add(
                "inventory-item",
                `tile-${tileType}`
            );

            inventoryButton.dataset.type = tileType;

            if (this.selectedInventoryTile === tileType) {
                inventoryButton.classList.add("selected");
            }

            const amountElement = document.createElement("span");
            const nameElement = document.createElement("span");

            nameElement.classList.add("inventory-name");
            nameElement.textContent = tileType;

            amountElement.classList.add("inventory-count");
            amountElement.textContent = amount;

            inventoryButton.appendChild(nameElement);
            inventoryButton.appendChild(amountElement);

            inventoryButton.addEventListener("click", () => {
                this.selectInventoryTile(tileType);
            });

            inventoryElement.appendChild(inventoryButton);
        });
    },

    selectInventoryTile(tileType) {
        if (this.inventory[tileType] <= 0) {
            return;
        }

        this.selectedInventoryTile = tileType;
        this.selectedTool = null;

        document.querySelectorAll(".tool").forEach((button) => {
            button.classList.remove("selected");
        });

        this.renderInventory();
    },

    placeFromInventory(rowIndex, columnIndex) {
        const currentTileType = this.world[rowIndex][columnIndex];

        if (currentTileType !== "sky") {
            this.showWrongAction();
            return;
        }

        const tileType = this.selectedInventoryTile;

        if (!tileType || this.inventory[tileType] <= 0) {
            return;
        }

        this.world[rowIndex][columnIndex] = tileType;

        this.inventory[tileType]--;

        if (this.inventory[tileType] === 0) {
            this.selectedInventoryTile = null;
        }

        this.renderWorld();
        this.renderInventory();
    },

    showWrongAction() {
        const worldElement = document.querySelector(".world");

        if (!worldElement) {
            return;
        }

        worldElement.classList.remove("wrong-action");

        // Force the browser to restart the animation if the user clicks wrongly again.
        void worldElement.offsetWidth;

        worldElement.classList.add("wrong-action");

        window.setTimeout(() => {
            worldElement.classList.remove("wrong-action");
        }, 300);
    },

    cloneWorld(worldToClone) {
        return worldToClone.map((row) => {
            return [...row];
        });
    },

    resetWorld() {
        this.world = this.cloneWorld(this.initialWorld);

        this.selectedTool = null;
        this.selectedInventoryTile = null;

        this.inventory = {
            tree: 0,
            trunk: 0,
            rock: 0,
            dirt: 0,
            grass: 0
        };

        document.querySelectorAll(".tool").forEach((button) => {
            button.classList.remove("selected");
        });

        this.renderWorld();
        this.renderInventory();
    },

    setupResetEvent() {
        const resetButton = document.querySelector(".reset-button");

        if (!resetButton) {
            return;
        }

        resetButton.addEventListener("click", () => {
            this.resetWorld();
        });
    },

    init() {
        this.world = this.cloneWorld(this.initialWorld);

        this.renderWorld();
        this.renderInventory();
        this.setupToolEvents();
        this.setupResetEvent();
    }
};

Game.init();