//
//  SpinAPIClient.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/25/26.
//
import Foundation

struct SpinAPIClient {
        
    let client = BareAPIClient(baseUrl: URL(string: "https://api.spinmyrecords.com/")!, headers: ["Content-Type" : "application/json"], useCredentials: true)
    
    func getRecords(paginationToken: String? = nil, interval: String? = nil) async throws -> [Record] {
        let result: ResponseData<RecordsResult> = try await client.get(
            resource: "public",
            queryParams: [
                URLQueryItem(name: "count", value: "10"),
                URLQueryItem(name: "token", value: paginationToken),
                URLQueryItem(name: "interval", value: interval)
            ]
        )
        return result.data.items
    }
    
    func getUpcoming(paginationToken: String? = nil) async throws -> [UpcomingRelease] {
        let result: ResponseData<UpcomingResult> = try await client.get(
            resource: "public/upcoming",
            queryParams: [
                URLQueryItem(name: "count", value: "10"),
                URLQueryItem(name: "token", value: paginationToken)
            ]
        )
        return result.data.items
    }
    

}
