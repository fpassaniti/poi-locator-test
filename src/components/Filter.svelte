<script>
    import config from '../../app.config';
    import {geojson} from '../utils/store2'

    let selected;

    $: if (selected) {
        geojson.updateWhereQuery("type_de_commerce:\"" + selected + "\"")
    } else {
        geojson.updateWhereQuery("")
    }
</script>

<div class="select my-2">
    <select bind:value={selected}>
        <option value="">
            -- Toutes les catégories --
        </option>
        {#each Object.keys(config.pictos) as choice}
            {#if choice !== "default"}
                <option value={choice}>
                    {choice}
                </option>
            {/if}
        {/each}
    </select>
</div>

<style lang="scss">
    select,
    .select {
        width: 100%;
    }
</style>