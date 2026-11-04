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

nonisolated struct RecordsResult: Decodable {
    let items: [Record]
    let cursor: String?
}

nonisolated struct UpcomingResult: Decodable {
    let items: [UpcomingRelease]
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

enum UnionDiscogsResult {
    case Master(Master)
    case Artist(Master)
    case Release(Master)
}
