import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/ask-knowledge-base.inline"

const AskKnowledgeBaseLoader: QuartzComponent = () => null
AskKnowledgeBaseLoader.afterDOMLoaded = script

export default (() => AskKnowledgeBaseLoader) satisfies QuartzComponentConstructor
