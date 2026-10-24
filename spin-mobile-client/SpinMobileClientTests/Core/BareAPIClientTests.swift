//
//  BareAPIClientTests.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/24/26.
//

import Testing
@testable import spin_mobile_client
import Foundation

struct BareAPIClientTests {
    
    let testSpinClient: BareAPIClient
    
    
    init() throws {
        guard let baseUrl = URL(string: "https://api.spinmyrecords.com/") else {
            throw URLError(.badURL)
        }
        
        testSpinClient = BareAPIClient(baseUrl: baseUrl, headers: ["Content-Type" : "application/json"], useCredentials: true)
    }

    
    @Test func getRequestTest() async throws {
        var result: ResponseData<RecordsResult> = try await testSpinClient.get(resource: "public", queryParams: [URLQueryItem(name: "count", value: "10")])
        print(result)
    }
}
