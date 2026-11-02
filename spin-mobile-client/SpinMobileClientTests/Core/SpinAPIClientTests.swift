//
//  BareAPIClientTests.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/24/26.
//

import Testing
@testable import spin_mobile_client
import Foundation

struct SpinAPIClientTests {
    
    let testSpinClient = SpinAPIClient()
    

    
    @Test func getRequestTest() async throws {
        var result: [Record] = try await testSpinClient.getRecords()
        print(result)
    }
    
    
    @Test func getUpcomingTest() async throws {
        var result: [UpcomingRelease] = try await testSpinClient.getUpcoming()
        print(result)
    }
}
