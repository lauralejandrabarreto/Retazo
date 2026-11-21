package models.mapping

import models.LugarHistorico
import models.LugarResumen

fun LugarHistorico.toResumen() = LugarResumen(
    id = id,
    nombre = nombre,
    sector = sector,
    ciudad = ciudad,
    pais = pais,
    siglo = siglo,
    epoca = epoca,
    coords = coords,
    imagen = imagen,
)