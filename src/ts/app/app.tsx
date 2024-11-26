import {createRoot} from "react-dom/client"
import React from 'react'
import {Container} from '@chakra-ui/react'
import {Provider} from "@/components/chakra/provider"
import p5 from "p5";
import {newExperimentSketch, newSketchModel} from "@/sketch/sketch-common";
import {
    NoiseBandControlPanel,
    newNoiseBandModel,
    newRandomBandOptions,
    NoiseBandOptions
} from "@/components/noise-band-control-panel";
import {newTransportModel, Transport} from "@/components/transport";

const r = document.getElementById('app')

// const transport = newTransport()
const canvasHeight = 10

let opts = newRandomBandOptions(window.innerWidth, 10)
let core = newRandomBandOptions(window.innerWidth, 10)
core.setBandRatio(0.1)
const c = core.getColorRange()
c.r = {min: 255, max: 255}
c.g = {min: 255, max: 255}
c.b = {min: 0, max: 0}
c.a = {min: 0, max: 255}
core.setColorRange(c)

const bg = core.getBackground()
bg.a = 0
core.setBackground(bg)

const optset: NoiseBandOptions[] = [opts, core];
const gap = 10
const sketchModel = newSketchModel({width: window.innerWidth, height: 500, parentId: 'app-canvas', background: 100})
const nb = newNoiseBandModel(sketchModel, optset, gap);
const tp = newTransportModel()

const p = new p5(newExperimentSketch(sketchModel, tp, nb))

if (r) {
    const root = createRoot(r)
    root.render(
        <Provider>
            <div id="app-canvas"></div>
            <Container>
                <Transport model={tp}/>
                <NoiseBandControlPanel model={nb}/>
            </Container>
        </Provider>
    )
} else {
    console.error(`Can't find id="app".`)
}

