//
//  BrowseViewModel.swift
//  spin-mobile-client
//
//  Created by Abhi on 11/3/26.
//

import SwiftUI

@Observable
class BrowseViewModel {
    var recordsData: [Record] = []
    var isLoadingRecords: Bool = false
    var hasNextToken: Bool = false
    var nextToken: String? = nil
    
    var apiClient = SpinAPIClient()
    
    func getRecords() async {
        do {
            let bundle = try await apiClient.getRecords(interval: 36, count: 20)
            recordsData = bundle.items
            nextToken = bundle.cursor
            hasNextToken = nextToken != nil
            
        } catch {
            print("API call failed")
        }
    }
}
