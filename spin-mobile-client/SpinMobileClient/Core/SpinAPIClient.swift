//
//  SpinAPIClient.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/25/26.
//
import Foundation

struct SpinAPIClient {
        
    let client = BareAPIClient(baseUrl: URL(string: "https://api.spinmyrecords.com/")!, headers: ["Content-Type" : "application/json"], useCredentials: true)
    
    func getRecords(paginationToken: String? = nil, interval: Int = 24, count: Int = 10) async throws -> DataListResult<Record> {
        let result: ResponseData<DataListResult<Record>> = try await client.get(
            resource: "public",
            queryParams: [
                URLQueryItem(name: "count", value: String(count)),
                URLQueryItem(name: "token", value: paginationToken),
                URLQueryItem(name: "interval", value: String(interval))
            ]
        )
        return result.data
    }
    
    func getUpcoming(paginationToken: String? = nil) async throws -> DataListResult<UpcomingRelease> {
        let result: ResponseData<DataListResult<UpcomingRelease>> = try await client.get(
            resource: "public/upcoming",
            queryParams: [
                URLQueryItem(name: "count", value: "10"),
                URLQueryItem(name: "token", value: paginationToken)
            ]
        )
        return result.data
    }
    
    func browseData(queryString: String, paginationToken: String? = nil) async throws -> SearchResult {
        let result: ResponseData<SearchResult> = try await client.get(
            resource: "search/search",
            queryParams: [
                URLQueryItem(name: "q", value: queryString)
            ]
        )
        return result.data
    }
    

}

