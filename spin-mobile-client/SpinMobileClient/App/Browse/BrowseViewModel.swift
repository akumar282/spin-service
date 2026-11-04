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
    
    var apiClient = SpinAPIClient()
}
