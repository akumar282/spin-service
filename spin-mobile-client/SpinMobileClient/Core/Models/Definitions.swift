//
//  Models.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/23/26.
//

struct ResponseData<T: Decodable> {
    let statusCode: Int
    let data: T
}

enum Media: String, Codable {
    case cd = "CD"
    case vinyl = "Vinyl"
}

struct Record: Codable {
    let releaseType: String?
    let preorder: Bool?
    let album: String
    let postId: String
    let artist: String
    let year: String?
    let media: Media
    let postTitle: String?
    let content: String?
    let link: String?
    let pagination: String?
    let searchString: String?
    let color: String?
    let thumbnail: String?
    let genre: [String]?
    let title: String?
    let label: [String]?
    let created_time: String
    let moreContent: String?
    let resource_url: String?
    let uri: String?
    let dateGroup: String
    let expires: Int
    let secondaryId: String?
    let source: String
    let edition: String?
    let releaseDate: String?
    let format: String?
    let region: String?
    let isAnnouncement: Bool?
    let productImage: String?
}

struct UpcomingRelease: Codable {
    let album: String
    let artist: String
    let id: String
    let note: String
    let date: String
}

nonisolated struct DataListResult<T: Codable>: Decodable {
    let items: [T]
    let cursor: String?
}

struct Community: Codable {
    let want: Int
    let have: Int
}

struct Master: Codable {
    let country: String
    let year: String
    let format: [String]
    let label: [String]
    let type: String
    let genre: [String]
    let style: [String]
    let id: Int32
    let barcode: [String]
    let master_id: Int32
    let master_url: String
    let uri: String
    let catno: String
    let title: String
    let thumb: String
    let cover_image: String
    let resource_url: String
    let community: Community
}

struct Release: Codable, Identifiable {
    let country: String
    let year: String
    let format: [String]
    let label: [String]
    let type: String
    let genre: [String]
    let style: [String]
    let id: Int
    let barcode: [String]
    let master_id: Int
    let master_url: String
    let uri: String
    let catno: String
    let title: String
    let thumb: String
    let cover_image: String
    let resource_url: String
    let community: Community
    let format_quantity: Int
    let formats: [ReleaseFormat]
}

struct ReleaseFormat: Codable {
    let name: String
    let qty: String
    let descriptions: [String]
}

struct Artist: Codable {
    let id: Int
    let type: String
    let master_id: Int?
    let master_url: String?
    let uri: String
    let title: String
    let thumb: String
    let cover_image: String
    let resource_url: String
}

enum UnionDiscogsResult: Decodable {
    case master(Master)
    case artist(Artist)
    case release(Release)
    
    private enum CodingKeys: String, CodingKey {
        case type
    }
    
    init (from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)
        
        switch type {
        case "master":
            self = .master(try Master(from: decoder))
        case "artist":
            self = .artist(try Artist(from: decoder))
        case "release":
            self = .release(try Release(from: decoder))
        default:
            throw DecodingError.dataCorruptedError(
                forKey: .type,
                in: container,
                debugDescription: "Unknown result type: \(type)"
            )
        }
    }
}

struct SearchResult: Decodable {
    let results: [UnionDiscogsResult]
    let cursor: String?
}
