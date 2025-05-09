<template>
    <nav>
        <ul>
            <li>
                <router-link to="/">Página inicial</router-link>
            </li>
            <li>
                <router-link to="/admin/user/read">Users</router-link>
            </li>
            <li>
                <router-link to="/logout">Logout</router-link>
            </li>
        </ul>
    </nav>
</template>

<style lang="scss" scoped>
@use "../../../styles/colors" as *;
li {
    list-style: none;
    margin: 0;
    padding: 0;
}
ul{
    display: inline-flex;
    gap: 1rem;
}
a:link, a:visited {
    text-decoration: none;
    color: $white;
}
a:hover {
    text-decoration: underline;
}
</style>