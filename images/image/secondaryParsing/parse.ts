import * as OpenAI from 'openai'
import { getEnv } from '../../utils'
import { PostInfo } from '../index'

const client = new OpenAI.OpenAI({
  organization: getEnv('OPEN_AI_ORG_ID'),
  apiKey: getEnv('OPEN_AI_KEY')
})

async function getMetadata(data: string) {
  const response = await client.responses.create({
    model: "gpt-5-nano",
    reasoning: { effort: "minimal" },
    input: [
      {
        role: "system",
        content: "You are an extraction engine. \n" +
          "Your job is to parse vinyl release post titles and return metadata in a list of JSON.\n" +
          "\n" +
          "The titles may contain extra noise such as stock warnings, marketing phrases, shipping notes, or parenthetical editions. \n" +
          "\n" +
          "Rules:\n" +
          "1. Infer artist when possible.\n" +
          "2. Infer album even if malformed or formatted inconsistently.\n" +
          "3. Extract vinyl format such as \"LP\", \"2LP\", \"Boxset\", \"Deluxe\", etc.\n" +
          "4. Extract color variants such as \"pink\", \"blue\", \"mauve\", \"clear\", \"magenta\".\n" +
          "5. Extract edition information such as \"limited\", \"exclusive\", \"numbered /500\".\n" +
          "6. Extract release dates if mentioned.\n" +
          "7. Create a canonical 'searchString' by combining artist and album in the form: \n" +
          "   \"artist album\", but *exclude* format/color/edition keep it short and also exclude special chars.\n" +
          "8. If album is self-titled (S/T), use the artist name.\n" +
          "9. You may get longer titles so use data and context clues to avoid errors or hallucinations.\n" +
          "10. Capitalize the Words.\n" +
          "\n" +
          "Respond *only* with valid a JSON object using this structure:\n" +
          "\n" +
          "{\n" +
          "  \"artist\": \"\",\n" +
          "  \"album\": \"\",\n" +
          "  \"format\": \"\",\n" +
          "  \"color\": \"\",\n" +
          "  \"edition\": \"\",\n" +
          "  \"releaseDate\": \"\",\n" +
          "  \"searchString\": \"\"\n" +
          "  \"preorder\": boolean\n" +
          "}"
      },
      {
        role: "user",
        content: `${data}`
      },
    ],
  })
  return JSON.parse(response.output_text) as Partial<PostInfo>
}

export async function mapToData(list: Partial<PostInfo>[]) {
  for (const post of list) {
    if (post.postTitle && post.artist) {
      const data = await getMetadata(post.postTitle)
      post.artist = data.artist ?? post.artist
      post.color = setColor(data.color, post.color)
      post.searchString = data.searchString ?? post.searchString
      post.preorder = data.preorder
      post.edition = data.edition
      post.releaseDate = data.releaseDate ?? ''
      post.album = data.album
      post.format = data.format
    }
  }
}

function setColor(data: string | null | undefined, post: string | null | undefined) {
  if( data !== '' && data !== null && data !== undefined ) {
    return data
  } else {
    return post
  }
}

// function mergeData(scraped: Partial<PostInfo>, llm: Partial<PostInfo>, keys: (keyof PostInfo)[]) {
//   for (const key of keys) {
//     const value = llm[key]
//     if (value !== '' && value != null && scraped[key] !== undefined) {
//       scraped[key] = llm[key]
//     }
//   }
// }