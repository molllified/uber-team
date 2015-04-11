//
//  MainScreenViewController.h
//  UberTeam
//
//  Created by Jason Jiang on 4/10/15.
//
//

#import <UIKit/UIKit.h>

@interface MainScreenViewController : UIViewController

@property (weak, nonatomic) IBOutlet UIView *dashboardView;
@property (nonatomic, strong) NSArray *controlBlocks;

@end
