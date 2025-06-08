document.addEventListener("DOMContentLoaded", () => {
    let startDate = new Date().toLocaleString();
    let goldPerClick = 1;

    let gold = 0;
    let goldPerSecond = 0;
    let manualClicks = 0;
    let totalGenerated = 0;
    let buyAmount = 1;


    let upgrades = {
        mineur: { cost: 10, gps: 1, count: 0 },
        wagon: { cost: 100, gps: 5, count: 0 },
        camion: { cost: 500, gps: 10, count: 0 },
        pelleteuse: { cost: 1500, gps: 25, count: 0 },
        usine: { cost: 5000, gps: 75, count: 0 },
        camion_de_mine: { cost: 10000, gps: 150, count: 0 },
        excavatrice: { cost: 50000, gps: 500, count: 0 }
    };

    function loadGame() {
        try {
            const save = JSON.parse(localStorage.getItem("goldmineSave"));
            if (save) {
                startDate = save.startDate || new Date().toLocaleString();
                gold = save.gold || 0;
                goldPerSecond = 0;
                manualClicks = save.manualClicks || 0;
                totalGenerated = save.totalGenerated || 0;
                upgrades = save.upgrades || upgrades;
            }
        } catch (e) {
            console.error("Erreur lors du chargement de la sauvegarde :", e);
            localStorage.removeItem("goldmineSave");
            startDate = new Date().toLocaleString();
        }
        recalculateGoldPerSecond();
        updateDisplay();
    }

    function recalculateGoldPerSecond() {
        goldPerSecond = 0;
        for (const key in upgrades) {
            goldPerSecond += upgrades[key].count * upgrades[key].gps;
        }
    }

    function saveGame() {
        localStorage.setItem("goldmineSave", JSON.stringify({
            gold,
            goldPerSecond,
            manualClicks,
            totalGenerated,
            upgrades,
            startDate
        }));
    }

    function updateDisplay() {
        document.getElementById("goldmine-count").textContent = `Gold: ${gold}`;
        document.getElementById("startDate").textContent = `Début de la partie : ${startDate}`;
        document.getElementById("cps").textContent = `Or/sec : ${goldPerSecond}`;
        document.getElementById("clicks").textContent = `Clics manuels : ${manualClicks}`;
        document.getElementById("personnel").textContent = `Personnels (mineurs) : ${upgrades.mineur.count}`;
        document.getElementById("infra").textContent =
            `Infrastructures : ${upgrades.wagon.count + upgrades.camion.count + upgrades.pelleteuse.count + upgrades.usine.count + upgrades.camion_de_mine.count + upgrades.excavatrice.count}`;
        document.getElementById("total").textContent = `Total or généré : ${totalGenerated}`;

        for (const key in upgrades) {
            const countEl = document.getElementById(`count-${key}`);
            const costEl = document.getElementById(`cost-${key}`);
            if (countEl) countEl.textContent = `x${upgrades[key].count}`;
            if (costEl) {
                let total = 0;
                let tempCost = upgrades[key].cost;

                for (let i = 0; i < buyAmount; i++) {
                    total += tempCost;
                    tempCost = Math.floor(tempCost * 1.3);
                }

                costEl.textContent = `${total} or`;

                // Gérer les couleurs selon si on peut se l'offrir ou non
                if (gold >= upgrades[key].cost) {
                    costEl.classList.add("affordable");
                    costEl.classList.remove("unaffordable");
                } else {
                    costEl.classList.add("unaffordable");
                    costEl.classList.remove("affordable");
                }
            }
        }

    }

    function buyItem(item) {
        const u = upgrades[item];
        let totalCost = 0;
        let tempCost = u.cost;

        for (let i = 0; i < buyAmount; i++) {
            totalCost += tempCost;
            tempCost = Math.floor(tempCost * 1.3);
        }

        if (gold >= totalCost) {
            gold -= totalCost;
            for (let i = 0; i < buyAmount; i++) {
                u.count++;
                u.cost = Math.floor(u.cost * 1.3);
            }
            recalculateGoldPerSecond();
            updateDisplay();

            // effet visuel
            const el = document.querySelector(`.shop-item[data-item="${item}"]`);
            if (el) {
                el.classList.remove("flash");
                void el.offsetWidth;
                el.classList.add("flash");
            }
        }
    }

    function setBuyAmount(amount) {
        buyAmount = amount;
        document.querySelectorAll("#buy-mode button").forEach(btn => {
            btn.classList.toggle("active", btn.textContent === `x${amount}`);
        });
        updateDisplay();
    }

    document.querySelectorAll('#buy-mode button').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            setBuyAmount(amount);
        });
    });



    document.getElementById("goldmine").addEventListener("click", () => {
        gold += goldPerClick;
        manualClicks++;
        totalGenerated += goldPerClick;
        updateDisplay();

        const wagon = document.getElementById("goldmine");
        wagon.classList.add("clicked");
        setTimeout(() => wagon.classList.remove("clicked"), 100);
    });

    document.querySelectorAll('.shop-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.item;
            if (id) buyItem(id);
        });
    });

    document.getElementById("toggle-stats").addEventListener("click", () => {
        document.getElementById("stats-popup").classList.remove("hidden");
    });

    document.getElementById("close-stats").addEventListener("click", () => {
        document.getElementById("stats-popup").classList.add("hidden");
    });

    document.getElementById("reset-game").addEventListener("click", () => {
        if (confirm("Êtes-vous sûr de vouloir réinitialiser la partie ?")) {
            localStorage.removeItem("goldmineSave");
            location.reload();
        }
    });

    setInterval(() => {
        gold += goldPerSecond;
        totalGenerated += goldPerSecond;
        updateDisplay();
    }, 1000);

    setInterval(saveGame, 10000);
    loadGame();
});
