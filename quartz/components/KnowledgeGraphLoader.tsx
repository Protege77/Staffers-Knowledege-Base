import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/knowledge-graph.inline"

const KnowledgeGraphLoader: QuartzComponent = () => null
KnowledgeGraphLoader.afterDOMLoaded = script

export default (() => KnowledgeGraphLoader) satisfies QuartzComponentConstructor
