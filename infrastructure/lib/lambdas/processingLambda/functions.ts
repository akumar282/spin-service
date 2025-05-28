export function createQuery(artist: string, genres: string[]) {
  const shouldList = []
  shouldList.push({ match: { artists: artist } })
  if (genres && genres.length > 0) {
    for (const genre of genres) {
      shouldList.push({ match: { genres: genre } })
    }
  }
  return {
    query: {
      bool: {
        must: [
          {
            bool: {
              should: shouldList,
              minimum_should_match: 1,
            },
          },
        ],
      },
    },
  }
}
