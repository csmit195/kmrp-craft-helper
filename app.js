new Vue({
    el: "#app",
    data: {
        recipes: [],
        searchQuery: "",
        result: null,
        totalMaterials: {},
        showSuggestions: !1,
        error: null,
        loading: !0,
        quantity: 1,
        craftingSteps: [],
        userIngredients: {},
        displayIngredients: []
    },
    computed: {
        filteredSuggestions() {
            if (!this.searchQuery) return [];
            const e = this.searchQuery.toLowerCase().replace(/^\d+x?\s*/, "");
            return this.recipes.filter(t => t.name.toLowerCase().includes(e)).map(t => t.name).slice(0, 5)
        }
    },
    methods: {
        updateSuggestions() {
            this.showSuggestions = this.searchQuery.length > 0
        },
        selectSuggestion(e) {
            const t = this.searchQuery.match(/^(\d+)x?\s*/);
            this.searchQuery = `${t ? t[1] : 1} ${e}`, this.showSuggestions = !1, this.searchRecipe()
        },
        handleEnterKey(e) {
            if (this.filteredSuggestions.length === 1) this.selectSuggestion(this.filteredSuggestions[0]);
            else if (this.filteredSuggestions.length === 0) this.searchRecipe()
        },
        searchRecipe() {
            const e = this.searchQuery.match(/^(\d+)x?\s*(.+)$/);
            if (e) {
                this.quantity = parseInt(e[1]) || 1;
                const t = e[2].trim(),
                    i = this.recipes.find(s => s.name.toLowerCase() === t.toLowerCase());
                i ? (this.result = i, this.userIngredients = {}, this.updateDisplayIngredients(), this.calculateTotalMaterials(), this.error = null) : (this.result = null, this.totalMaterials = {}, this.error = "Recipe not found. Please try another item.")
            } else this.error = "Invalid input. Please try again."
        },
        updateDisplayIngredients() {
            this.displayIngredients = this.result.ingredients.map(e => ({
                item: e.item,
                quantity: e.quantity * this.quantity
            }))
        },
        calculateTotalMaterials() {
            let e = {},
                t = [];
            const i = (s, n) => {
                s.ingredients.forEach(r => {
                    const a = r.quantity * n,
                        c = this.recipes.find(h => h.name === r.item),
                        u = this.userIngredients[r.item] || 0;
                    if (c) {
                        const h = Math.max(0, a - u);
                        h > 0 && (t.push({
                            item: r.item,
                            quantity: h,
                            showDetails: !1
                        }), i(c, h))
                    } else e[r.item] = (e[r.item] || 0) + Math.max(0, a - u)
                })
            };
            i(this.result, this.quantity), this.totalMaterials = e, this.craftingSteps = t
        },
        isCrafted(e) {
            return this.recipes.some(t => t.name === e)
        },
        getIngredients(e) {
            const t = this.recipes.find(i => i.name === e);
            return t ? t.ingredients : []
        },
        toggleStepDetails(e) {
            this.$set(this.craftingSteps[e], "showDetails", !this.craftingSteps[e].showDetails)
        },
        handleIngredientInput(e, t) {
            e.target.textContent = e.target.textContent.replace(/[^0-9]/g, "")
        },
        updateIngredientQuantity(e, t) {
            const i = parseInt(t.target.textContent) || 0,
                s = this.result.ingredients[e];
            this.userIngredients[s.item] = Math.max(0, s.quantity * this.quantity - i), this.$set(this.displayIngredients, e, {
                item: s.item,
                quantity: i
            }), this.calculateTotalMaterials()
        },
        async fetchRecipes() {
            try {
                const e = await axios.get("data.json");
                this.recipes = e.data.recipes, this.loading = !1
            } catch (e) {
                console.error("Error fetching recipes:", e), this.error = "Failed to load recipes. Please try again later.", this.loading = !1
            }
        }
    },
    mounted() {
        this.fetchRecipes();
        window.addEventListener("keydown", e => {
            (e.ctrlKey || e.metaKey) && e.key === "k" && (e.preventDefault(), this.$refs.searchInput.focus())
        })
    }
});