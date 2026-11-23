plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(ktorLibs.plugins.ktor)
    // Misma versión que Kotlin (gradle/libs.versions.toml); una versión distinta del
    // plugin de serialización puede romper la compilación.
    alias(libs.plugins.kotlin.serialization)
}

group = "com.example"
version = "1.0.0-SNAPSHOT"

application {
    mainClass = "io.ktor.server.netty.EngineMain"
}

kotlin {
    jvmToolchain(21)
}
dependencies {
    implementation(ktorLibs.server.config.yaml)
    implementation(ktorLibs.server.core)
    implementation(ktorLibs.server.netty)
    implementation(libs.logback.classic)

    testImplementation(kotlin("test"))
    testImplementation(ktorLibs.server.testHost)

    implementation("io.ktor:ktor-server-status-pages")
    implementation("io.ktor:ktor-server-content-negotiation")
    implementation("io.ktor:ktor-serialization-kotlinx-json")

    implementation("io.ktor:ktor-server-cors")

    implementation("io.ktor:ktor-server-auth")
    implementation("io.ktor:ktor-server-auth-jwt")
    // Firebase Admin
    implementation("com.google.firebase:firebase-admin:9.2.0")

    implementation("at.favre.lib:bcrypt:0.10.2")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.11.0")

    // Cliente HTTP del asistente histórico (RAG) para llamar al modelo de lenguaje (Groq).
    implementation("io.ktor:ktor-client-core")
    implementation("io.ktor:ktor-client-cio")
    testImplementation("io.ktor:ktor-client-mock")
}

// Script de base de datos: crea/carga las colecciones de Firestore.
//   gradlew seed               -> crea lo que falte
//   gradlew seed -Preset=true  -> borra y vuelve a cargar todo
tasks.register<JavaExec>("seed") {
    group = "base de datos"
    description = "Carga los datos iniciales (periodos, lugares y usuarios de prueba) en Firestore."
    mainClass.set("database.SeedKt")
    classpath = sourceSets["main"].runtimeClasspath
    workingDir = projectDir
    if (project.findProperty("reset") == "true") args("--reset")
}

// Descarga las fotos de los lugares a database/seed/imagenes y actualiza lugares.json.
//   gradlew descargarImagenes   (después: gradlew seed)
tasks.register<JavaExec>("descargarImagenes") {
    group = "base de datos"
    description = "Descarga las fotografías de los lugares dentro del proyecto."
    mainClass.set("database.DescargarImagenesKt")
    classpath = sourceSets["main"].runtimeClasspath
    workingDir = projectDir
}
