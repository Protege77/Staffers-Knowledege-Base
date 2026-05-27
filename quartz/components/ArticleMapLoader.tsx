import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/maps.inline"

const ArticleMapLoader: QuartzComponent = () => null
ArticleMapLoader.afterDOMLoaded = script

export default (() => ArticleMapLoader) satisfies QuartzComponentConstructor
