import AdComponent from "discourse/plugins/discourse-adplugin/discourse/components/ad-component";
import {
  default as computed,
  observes
} from "ember-addons/ember-computed-decorators";

const adConfig = Ember.Object.create({
  "google-adsense": {
    settingPrefix: "adsense", // settings follow naming convention
    enabledSetting: "adsense_publisher_code",
    nthPost: "adsense_nth_post_code"
  },
  "google-dfp-ad": {
    settingPrefix: "dfp", // settings follow naming convention
    enabledSetting: "dfp_publisher_id",
    nthPost: "dfp_nth_post_code"
  },
  "amazon-product-links": {
    settingPrefix: "amazon",
    enabledSetting: false,
    nthPost: "amazon_nth_post_code",
    desktop: {
      "topic-list-top": "amazon_topic_list_top_src_code",
      "post-bottom": "amazon_post_bottom_src_code",
      "topic-above-post-stream": "amazon_topic_above_post_stream_src_code",
      "topic-above-suggested": "amazon_topic_above_suggested_src_code"
    },
    mobile: {
      "topic-list-top": "amazon_mobile_topic_list_top_src_code",
      "post-bottom": "amazon_mobile_post_bottom_src_code",
      "topic-above-post-stream":
        "amazon_mobile_topic_above_post_stream_src_code",
      "topic-above-suggested": "amazon_mobile_topic_above_suggested_src_code"
    }
  },
  "codefund-ad": {
    settingPrefix: "codefund",
    enabledSetting: "codefund_property_id",
    nthPost: "codefund_nth_post",
    desktop: {
      "topic-list-top": "codefund_top_of_topic_list_enabled",
      "post-bottom": "codefund_below_post_enabled",
      "topic-above-post-stream": "codefund_above_post_stream_enabled",
      "topic-above-suggested": "codefund_above_suggested_enabled"
    }
  },
  "carbonads-ad": {
    settingPrefix: "carbonads",
    enabledSetting: "carbonads_serve_id",
    desktop: {
      "topic-list-top": "carbonads_topic_list_top_enabled",
      "post-bottom": false,
      "topic-above-post-stream": "carbonads_above_post_stream_enabled",
      "topic-above-suggested": false
    }
  }
});

const displayCounts = {
  houseAds: 0,
  allAds: 0
};

export default AdComponent.extend({
  needsUpdate: false,

  /**
   * For a given ad placement and optionally a post number if in between posts,
   * list all ad network names that are configured to show there.
   */
  @computed("placement", "postNumber")
  availableAdTypes(placement, postNumber) {
  
    let types = [];

  
    /* block certain page ID's from adsense */
    var url = window.location.href;

    if( url.indexOf("/t/") > -1) {
      var parameters = url.split("/");
      var topic_id = parseInt(parameters[5]);

      var blockedIDs = [1077651,1077666,1077687,1077689,1077740,1077926,1078033,1111543,1113270,1119031,1122065,1152036,1152429,1157770,1162167,294363,294999,295216,296478,297183,298776,299074,303564,303672,304180,304926,306211,307207,310238,310807,310956,312365,312520,312841,313126,313152,313210,313298,314969,316075,319453,320120,321361,321603,323541,326155,326543,327561,328111,328280,329537,329591,330089,330490,331011,331234,331463,332747,333279,333336,333555,334899,335222,335801,336292,337454,339698,340062,340480,340735,342654,343482,343868,344174,345303,348023,348684,349053,350757,351485,352083,352530,352711,352726,354125,354760,354864,355200,358264,358860,359424,360203,360918,361295,361917,362571,363142,364420,365262,367923,368394,369769,369984,371201,371687,371942,373942,374518,374591,376865,376946,378268,378866,378874,379056,379618,380954,380965,382371,383072,383847,384897,385871,388354,388877,389073,389635,389883,390988,391223,391802,392293,392788,393549,394782,396643,399145,400509,402873,404752,405425,405992,409692,409830,409939,411026,412900,415494,416883,417221,417649,417936,417996,420946,422762,423169,424009,424472,424744,425080,427912,428436,429282,429359,429527,429557,429732,429943,430886,431907,433564,433590,433921,434432,437249,437574,437613,437900,439053,439152,439746,440177,441197,442163,445825,446471,447664,448413,450006,451312,453319,453815,454483,454592,457630,458083,459447,459540,459682,463074,463409,464503,465600,468848,470139,471645,471938,474177,476112,476895,476988,477929,480881,481168,482343,485955,487363,489333,489566,489730,490406,491112,491228,491228,492357,492796,493112,493335,493369,493612,494913,495014,495226,496732,497128,498749,504101,504616,505869,510390,510916,511329,517108,518558,519284,521650,525289,525430,525706,528972,529243,529413,530260,530974,531299,533248,533871,536434,538734,543821,548019,548377,556721,557053,558581,559086,559910,560963,561533,563311,564861,565468,566588,567958,573183,574283,575581,575744,576315,577585,578936,579690,581180,582961,589340,592980,595520,596304,600135,600783,611696,613496,617011,620277,621728,625764,625906,638801,641742,650504,654226,654837,655068,661986,663323,669217,670522,671460,672759,675209,677718,680990,700933,701371,713766,713850,725710,725725,971475,972627];

    if( blockedIDs.includes(topic_id)){
        console.log('no ads');
        return types;
      }

    }
  
  
    const houseAds = this.site.get("house_creatives"),
      placeUnderscored = placement.replace(/-/g, "_");

    if (houseAds && houseAds.settings) {
      const adsForSlot = houseAds.settings[placeUnderscored];

      if (
        Object.keys(houseAds.creatives).length > 0 &&
        !Ember.isBlank(adsForSlot) &&
        (!postNumber ||
          this.isNthPost(parseInt(houseAds.settings.after_nth_post, 10)))
      ) {
        types.push("house-ad");
      }
    }

    Object.keys(adConfig).forEach(adNetwork => {
      const config = adConfig[adNetwork];
      let settingNames = null,
        name;

      if (
        config.enabledSetting &&
        !Ember.isBlank(this.siteSettings[config.enabledSetting]) &&
        (!postNumber ||
          !config.nthPost ||
          this.isNthPost(parseInt(this.siteSettings[config.nthPost], 10)))
      ) {
        if (this.site.mobileView) {
          settingNames = config.mobile || config.desktop;
        } else {
          settingNames = config.desktop;
        }

        if (settingNames) {
          name = settingNames[placement];
        }

        if (name === undefined) {
          // follows naming convention: prefix_(mobile_)_{placement}_code
          name = `${config.settingPrefix}_${
            this.site.mobileView ? "mobile_" : ""
          }${placeUnderscored}_code`;
        }

        if (name !== false && !Ember.isBlank(this.siteSettings[name])) {
          types.push(adNetwork);
        }
      }
    });

    return types;
  },

  /**
   * When house ads are configured to alternate with other ad networks, we
   * need to trigger an update of which ad component is shown after
   * navigating between topic lists or topics.
   */
  @observes("refreshOnChange")
  changed() {
    if (this.get("listLoading")) {
      return;
    }

    // force adComponents to be recomputed
    this.notifyPropertyChange("needsUpdate");
  },

  /**
   * Returns a list of the names of ad components that should be rendered
   * in the given ad placement. It handles alternating between house ads
   * and other ad networks.
   */
  @computed("placement", "availableAdTypes", "needsUpdate")
  adComponents(placement, availableAdTypes) {
    if (
      !availableAdTypes.includes("house-ad") ||
      availableAdTypes.length === 1
    ) {
      // Current behaviour is to allow multiple ads from different networks
      // to show in the same place. We could change this to choose one somehow.
      return availableAdTypes;
    }

    const houseAds = this.site.get("house_creatives");
    let houseAdsSkipped = false;

    if (houseAds.settings.house_ads_frequency === 100) {
      // house always wins
      return ["house-ad"];
    } else if (houseAds.settings.house_ads_frequency > 0) {
      // show house ads the given percent of the time
      if (
        displayCounts.allAds === 0 ||
        (100 * displayCounts.houseAds) / displayCounts.allAds <
          houseAds.settings.house_ads_frequency
      ) {
        displayCounts.houseAds += 1;
        displayCounts.allAds += 1;
        return ["house-ad"];
      } else {
        houseAdsSkipped = true;
      }
    }

    const networkNames = availableAdTypes.filter(x => x !== "house-ad");

    if (houseAdsSkipped) {
      displayCounts.allAds += networkNames.length;
    }

    return networkNames;
  }
});
