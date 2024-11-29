import {scale} from "@/lib-core"
import p5 from "p5"
import {NoiseBandModel} from "@/components/noise-band-control-panel";
import {Transport} from "@/components/transport";
import {SampleAnalyzer} from "@/audio/sample-analyzer";
import {VuMeter} from "@/audio/vu-meter";
import {newStarField} from "@/sketch/stars";
import {newWave, Wave} from "@/sketch/waves";

export interface SketchModel {
    getHeight(): number

    getWidth(): number

    getParentId(): string

    getBackground(): number
}

export function newExperimentSketch(sketchModel: SketchModel, transport: Transport, noiseBandModel: NoiseBandModel, analyzer: () => SampleAnalyzer) {
    let vuMeter: VuMeter
    let vu = 0
    let target = 0
    let padding = 30
    const yOffset = padding
    let fill = 255
    vuMeter = new VuMeter(0.1, 0.3, 24)
    const xmin = 0
    const xmax = sketchModel.getWidth()
    const ymin = 0
    const ymax = sketchModel.getHeight() - padding
    const stars = newStarField(1024, xmin, xmax, ymin, ymax, 1, 50, () => vuMeter)
    const wave = newWave(sketchModel.getWidth(), sketchModel.getHeight() - padding, vuMeter)
    return (p: p5) => {
        p.preload = () => {

        }
        p.setup = () => {
            p.createCanvas(window.innerWidth, sketchModel.getHeight()).parent(sketchModel.getParentId())
            noiseBandModel.update(p)
            p.background(sketchModel.getBackground());
        }

        p.draw = () => {
            p.fill(fill)
            noiseBandModel.update(p)
            const gap = noiseBandModel.getBandGap()
            p.background(sketchModel.getBackground())
            const innerWidth = sketchModel.getWidth() - 2 * padding

            let dim = 50
            const sa = analyzer()

            // draw stars
            stars.forEach((s) => s.draw(p))

            // draw moon
            p.rect((padding + ((transport.getPosition() / 32) % innerWidth)) - dim/2, yOffset - dim/2, dim, dim)


            // draw waves
            p.stroke(127)
            wave.draw(p)

            if (sa) {

                const gap = padding
                const yOffset = gap
                let xOffset = gap
                const fft = sa.getFft()
                if (transport.getPosition() % 8 == 0) {
                    target = sa.getLevel()
                    vuMeter.setTarget(target)
                }
                // vu = (target - vu) / 2
                vuMeter.update()
                vu = vuMeter.getValue()
                const level = 10 * Math.pow(scale(vu, 0, 1, 1, sketchModel.getHeight() - yOffset), .5)

                // set square size proportional to audio level
                dim *= 10 * vu

                // draw level indicator
                const indicatorWidth = gap
                p.rect(xOffset, sketchModel.getHeight() - yOffset - level, indicatorWidth, level)

                // draw FFT graph
                xOffset += gap + indicatorWidth
                const w = (sketchModel.getWidth() - xOffset - padding) / fft.length
                const y1 = sketchModel.getHeight() - yOffset
                p.stroke(255)
                p.strokeWeight(w)
                sa.getFft().forEach((f, i) => {
                    const ff = 160 + f
                    const x = xOffset + (i * w)
                    const y2 = y1 - ff
                    p.line(x, y1, x, y2)
                })
            }




            // Draw noise band display
            if (gap > 0) {
                const images = noiseBandModel.getImages();
                p.tint(255, scale(noiseBandModel.getOpacity(), 0, 1, 0, 255))
                for (let i = 0, y = 0; i < images.length; i++, y += gap) {
                    const img = images[i]
                    p.image(img, 0, y)
                }
            }
            transport.tick()
        }
    }
}

export interface Sprite {
    draw(p: p5)
}