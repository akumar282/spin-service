//
//  SpinAPIClient.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/25/26.
//
import Foundation

struct SpinAPIClient {
    
    let baseURL: URL
    let client: BareAPIClient
    
    init() throws {
        guard let baseURL = URL(string: "https://api.spinmyrecords.com/") else {
            throw URLError(.badURL)
        }
        
        self.baseURL = baseURL
    
        client = BareAPIClient(baseUrl: baseURL, headers: ["Content-Type" : "application/json"], useCredentials: true)
    }
    
    func getRecords(paginationToken: String?, interval: String?) async throws -> [Record] {
        var result: ResponseData<RecordsResult> = try await client.get(
            resource: "public",
            queryParams: [
                URLQueryItem(name: "count", value: "10"),
                URLQueryItem(name: "token", value: paginationToken),
                URLQueryItem(name: "interval", value: interval)
            ]
        )
        return result.data.items
    }
    

    
}
