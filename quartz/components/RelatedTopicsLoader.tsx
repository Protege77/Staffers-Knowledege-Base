import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/related-topics.inline"

const RelatedTopicsLoader: QuartzComponent = () => null
RelatedTopicsLoader.afterDOMLoaded = script

export default (() => RelatedTopicsLoader) satisfies QuartzComponentConstructor
