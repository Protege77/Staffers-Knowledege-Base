import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/submit-article.inline"

const SubmitArticleLoader: QuartzComponent = () => null
SubmitArticleLoader.afterDOMLoaded = script

export default (() => SubmitArticleLoader) satisfies QuartzComponentConstructor
